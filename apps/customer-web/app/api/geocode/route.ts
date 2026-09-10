import { NextResponse } from 'next/server';

const API_BASE = process.env.API_INTERNAL_URL || 'http://localhost:4000/api/v1';

// Haversine distance in kilometers
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const query = searchParams.get('query');
    const placeId = searchParams.get('placeId');
    const address = searchParams.get('address');

    // Fetch tenant settings to check for Google Maps API key & branches
    let googleApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    let branches: any[] = [];

    try {
      const [configRes, branchesRes] = await Promise.all([
        fetch(`${API_BASE}/v1/storefront/config`, { cache: 'no-store' }),
        fetch(`${API_BASE}/v1/branches`, { cache: 'no-store' }),
      ]);

      if (configRes.ok) {
        const cData = await configRes.json();
        const theme = cData.settings?.theme_json || {};
        if (theme.google_maps_api_key) {
          googleApiKey = theme.google_maps_api_key.trim();
        }
      }

      if (branchesRes.ok) {
        branches = await branchesRes.json();
      }
    } catch {
      // Fallback if internal API lookup has transient issue
    }

    // Helper to calculate nearest branch from coordinates
    const findNearestBranch = (latitude: number, longitude: number) => {
      let nearest: any = null;
      let minDistance = Infinity;

      if (Array.isArray(branches) && branches.length > 0) {
        for (const b of branches) {
          if (b.latitude != null && b.longitude != null) {
            const dist = calculateDistanceKm(latitude, longitude, b.latitude, b.longitude);
            if (dist < minDistance) {
              minDistance = dist;
              nearest = {
                id: b.id,
                name: b.name,
                city: b.city,
                address: b.address_line,
                phone: b.phone,
                distanceKm: dist,
              };
            }
          }
        }
      }
      return nearest;
    };

    // 1. Handle Place Details Resolution (Google Place ID)
    if (placeId) {
      if (googleApiKey) {
        try {
          const pRes = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address,name,address_components&language=en&key=${googleApiKey}`
          );
          if (pRes.ok) {
            const pData = await pRes.json();
            if (pData.result && pData.result.geometry) {
              const latitude = pData.result.geometry.location.lat;
              const longitude = pData.result.geometry.location.lng;
              const formattedAddress = pData.result.formatted_address || pData.result.name;
              const nearestBranch = findNearestBranch(latitude, longitude);

              return NextResponse.json({
                formattedAddress,
                latitude,
                longitude,
                provider: 'google',
                nearestBranch,
              });
            }
          }
        } catch (err) {
          console.error('Google Place Details error:', err);
        }
      }
      return NextResponse.json({ error: 'Could not resolve place ID' }, { status: 404 });
    }

    // 2. Handle Autocomplete Search Query
    if (query && query.trim().length > 1) {
      const q = query.trim();
      const suggestions: any[] = [];

      // A. If Google Maps API key is configured, query Google Places Autocomplete
      if (googleApiKey) {
        try {
          const googleRes = await fetch(
            `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
              q
            )}&components=country:pk&language=en&key=${googleApiKey}`
          );
          if (googleRes.ok) {
            const gData = await googleRes.json();
            if (Array.isArray(gData.predictions)) {
              for (const p of gData.predictions) {
                suggestions.push({
                  id: p.place_id,
                  placeId: p.place_id,
                  title: p.structured_formatting?.main_text || p.description,
                  subtitle: p.structured_formatting?.secondary_text || '',
                  fullAddress: p.description,
                  provider: 'google',
                });
              }
            }
          }
        } catch (err) {
          console.error('Google Places Autocomplete error:', err);
        }
      }

      // B. Photon by Komoot (Ultra-fast OSM autocomplete with Pakistani location bias, returns coordinates immediately)
      try {
        const biasLat = branches[1]?.latitude || branches[0]?.latitude || 33.6844;
        const biasLng = branches[1]?.longitude || branches[0]?.longitude || 73.0479;
        const photonRes = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lat=${biasLat}&lon=${biasLng}&limit=8&lang=en`
        );
        if (photonRes.ok) {
          const pData = await photonRes.json();
          if (Array.isArray(pData.features)) {
            for (const f of pData.features) {
              const props = f.properties || {};
              const coords = f.geometry?.coordinates || []; // [lng, lat]
              const lngVal = coords[0];
              const latVal = coords[1];

              // Prefer results in Pakistan
              const country = props.country || '';
              const isPakistan = !country || country.toLowerCase().includes('pakistan');

              if (isPakistan && latVal && lngVal) {
                const titleParts = [props.name || props.housenumber, props.street || props.locality].filter(Boolean);
                const title = titleParts.length > 0 ? titleParts.join(', ') : props.name || q;
                const subParts = [props.district, props.city || props.town, props.state, 'Pakistan'].filter(Boolean);
                const subtitle = subParts.join(', ');
                const fullAddress = [title, subtitle].filter(Boolean).join(', ');

                // Avoid duplicate titles
                if (!suggestions.some((s) => s.title.toLowerCase() === title.toLowerCase())) {
                  suggestions.push({
                    id: `photon-${props.osm_id || Math.random().toString(36).substring(7)}`,
                    title,
                    subtitle,
                    fullAddress,
                    lat: latVal,
                    lng: lngVal,
                    provider: 'photon',
                  });
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Photon Autocomplete error:', err);
      }

      // C. OpenStreetMap Nominatim Fallback if needed
      if (suggestions.length === 0) {
        try {
          const osmRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              q
            )}&countrycodes=pk&addressdetails=1&limit=5&accept-language=en`,
            {
              headers: { 'User-Agent': 'CheeziousDelivery/1.0' },
            }
          );

          if (osmRes.ok) {
            const osmData = await osmRes.json();
            for (const item of osmData || []) {
              const addr = item.address || {};
              const main = item.name || addr.road || addr.suburb || addr.neighbourhood || q;
              const sub = [addr.city || addr.town, addr.state, 'Pakistan'].filter(Boolean).join(', ');

              suggestions.push({
                id: `osm-${item.place_id}`,
                title: main,
                subtitle: sub,
                fullAddress: item.display_name,
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
                provider: 'osm',
              });
            }
          }
        } catch (err) {
          console.error('OSM Autocomplete error:', err);
        }
      }

      return NextResponse.json({ suggestions });
    }

    // 3. Handle Raw Address Forward Geocoding
    if (address && address.trim().length > 2) {
      const addrQuery = address.trim();

      // Attempt Google Geocoding if key present
      if (googleApiKey) {
        try {
          const gRes = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
              addrQuery
            )}&components=country:pk&language=en&key=${googleApiKey}`
          );
          if (gRes.ok) {
            const gData = await gRes.json();
            if (gData.results && gData.results.length > 0) {
              const r = gData.results[0];
              const latitude = r.geometry.location.lat;
              const longitude = r.geometry.location.lng;
              const nearestBranch = findNearestBranch(latitude, longitude);

              return NextResponse.json({
                formattedAddress: r.formatted_address,
                latitude,
                longitude,
                provider: 'google',
                nearestBranch,
              });
            }
          }
        } catch (err) {
          console.error('Google forward geocode error:', err);
        }
      }

      // Photon forward geocoding
      try {
        const pRes = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(addrQuery)}&limit=1&lang=en`
        );
        if (pRes.ok) {
          const pData = await pRes.json();
          if (pData.features && pData.features.length > 0) {
            const f = pData.features[0];
            const coords = f.geometry?.coordinates || [];
            const longitude = coords[0];
            const latitude = coords[1];
            if (latitude && longitude) {
              const nearestBranch = findNearestBranch(latitude, longitude);
              const props = f.properties || {};
              const title = [props.name || props.housenumber, props.street || props.locality].filter(Boolean).join(', ');
              const sub = [props.district, props.city || props.town, 'Pakistan'].filter(Boolean).join(', ');
              const formattedAddress = [title, sub].filter(Boolean).join(', ') || addrQuery;

              return NextResponse.json({
                formattedAddress,
                latitude,
                longitude,
                provider: 'photon',
                nearestBranch,
              });
            }
          }
        }
      } catch (err) {
        console.error('Photon forward geocode error:', err);
      }
    }

    // 4. Handle Reverse Geocoding for Coordinates (lat, lng) - "Live Location"
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      if (isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
      }

      let formattedAddress = '';
      let addressComponents: any = {};
      let provider = 'photon';

      // Engine 1: Google Maps Geocoding API if key configured
      if (googleApiKey) {
        try {
          const gRes = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&language=en&key=${googleApiKey}`
          );
          if (gRes.ok) {
            const gData = await gRes.json();
            if (gData.results && gData.results.length > 0) {
              const bestResult = gData.results[0];
              formattedAddress = bestResult.formatted_address;
              provider = 'google';

              bestResult.address_components?.forEach((c: any) => {
                if (c.types.includes('route')) addressComponents.street = c.long_name;
                if (c.types.includes('sublocality') || c.types.includes('neighborhood')) {
                  addressComponents.sector = c.long_name;
                }
                if (c.types.includes('locality')) addressComponents.city = c.long_name;
              });
            }
          }
        } catch (err) {
          console.error('Google Geocoding error:', err);
        }
      }

      // Engine 2: Photon Reverse Geocoding (Instant, accurate street & locality for Pakistan)
      if (!formattedAddress) {
        try {
          const pRes = await fetch(
            `https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}&lang=en`
          );
          if (pRes.ok) {
            const pData = await pRes.json();
            if (pData.features && pData.features.length > 0) {
              const f = pData.features[0];
              const props = f.properties || {};

              const building = props.name || props.housenumber;
              const street = props.street;
              const locality = props.locality || props.district;
              const city = props.city || props.town || 'Islamabad';
              const state = props.state;

              addressComponents = { street, sector: locality, city, state };

              const parts = [building, street, locality, city, state, 'Pakistan'].filter(Boolean);
              // Deduplicate identical parts
              const uniqueParts = parts.filter((val, idx) => parts.indexOf(val) === idx);
              formattedAddress = uniqueParts.join(', ');
              provider = 'photon';
            }
          }
        } catch (err) {
          console.error('Photon reverse error:', err);
        }
      }

      // Engine 3: OpenStreetMap Nominatim with English localization
      if (!formattedAddress) {
        try {
          const osmRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=en`,
            {
              headers: { 'User-Agent': 'CheeziousDelivery/1.0' },
            }
          );

          if (osmRes.ok) {
            const osmData = await osmRes.json();
            const addr = osmData.address || {};

            const street = addr.road || addr.street;
            const sector = addr.suburb || addr.neighbourhood || addr.residential;
            const city = addr.city || addr.town || addr.county;
            const state = addr.state;

            addressComponents = { street, sector, city, state };

            const parts = [
              street,
              sector,
              city,
              state && state !== city ? state : null,
              'Pakistan',
            ].filter(Boolean);

            if (parts.length > 0) {
              formattedAddress = parts.join(', ');
            } else if (osmData.display_name) {
              formattedAddress = osmData.display_name;
            }
            provider = 'osm';
          }
        } catch (err) {
          console.error('Nominatim Reverse Geocoding error:', err);
        }
      }

      // Engine 4: BigDataCloud client API fallback
      if (!formattedAddress) {
        try {
          const bdcRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          if (bdcRes.ok) {
            const bdcData = await bdcRes.json();
            const locality = bdcData.locality || bdcData.city || 'Islamabad';
            const subdivision = bdcData.principalSubdivision || 'Islamabad Capital Territory';
            formattedAddress = `${locality}, ${subdivision}, Pakistan`;
            addressComponents = { city: locality, state: subdivision };
            provider = 'bigdatacloud';
          }
        } catch (err) {
          console.error('BigDataCloud error:', err);
        }
      }

      // Nearest Branch Matcher
      const nearestBranch = findNearestBranch(latitude, longitude);

      if (!formattedAddress) {
        formattedAddress = nearestBranch
          ? `${nearestBranch.name} Delivery Zone, ${nearestBranch.city} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
          : `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
      }

      return NextResponse.json({
        formattedAddress,
        latitude,
        longitude,
        components: addressComponents,
        provider,
        nearestBranch,
      });
    }

    return NextResponse.json({ error: 'Provide lat/lng, query, or placeId' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
