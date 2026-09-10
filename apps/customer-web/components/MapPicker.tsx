'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Map as LeafletMap } from 'leaflet';

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  onLocationChange?: (loc: {
    lat: number;
    lng: number;
    address: string;
    nearestBranch?: any;
  }) => void;
  onSelect: (address: string, details?: { lat: number; lng: number; nearestBranch?: any }) => void;
}

interface Suggestion {
  id: string;
  title: string;
  subtitle: string;
  fullAddress: string;
  lat?: number;
  lng?: number;
  provider?: string;
}

export default function MapPicker({
  initialLat,
  initialLng,
  initialAddress,
  onLocationChange,
  onSelect,
}: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);

  // Default coordinates (Islamabad Center)
  const defaultLat = initialLat || 33.6844;
  const defaultLng = initialLng || 73.0479;

  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: defaultLat,
    lng: defaultLng,
  });
  const [currentAddress, setCurrentAddress] = useState<string>(
    initialAddress || 'Islamabad, Islamabad Capital Territory, Pakistan'
  );
  const [nearestBranch, setNearestBranch] = useState<any>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isMapMoving, setIsMapMoving] = useState(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);

  // Autocomplete search states
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reverseGeocodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reverse geocoding function
  const fetchAddressForCoords = useCallback(
    async (lat: number, lng: number) => {
      try {
        setIsLoadingAddress(true);
        const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
        if (res.ok) {
          const data = await res.json();
          if (data.formattedAddress) {
            setCurrentAddress(data.formattedAddress);
            setNearestBranch(data.nearestBranch || null);
            if (onLocationChange) {
              onLocationChange({
                lat,
                lng,
                address: data.formattedAddress,
                nearestBranch: data.nearestBranch,
              });
            }
          }
        }
      } catch (err) {
        console.error('Reverse geocode error:', err);
      } finally {
        setIsLoadingAddress(false);
      }
    },
    [onLocationChange]
  );

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = await import('leaflet');

      if (!isMounted || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      // CartoDB Voyager tiles (modern, clear street & place names)
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          maxZoom: 19,
          subdomains: 'abcd',
        }
      ).addTo(map);

      // Event: User starts dragging/moving map
      map.on('movestart', () => {
        setIsMapMoving(true);
        setShowSuggestions(false);
      });

      // Event: User stops dragging/moving map
      map.on('moveend', () => {
        setIsMapMoving(false);
        const center = map.getCenter();
        setCurrentCoords({ lat: center.lat, lng: center.lng });

        // Debounced reverse geocoding
        if (reverseGeocodeTimeoutRef.current) {
          clearTimeout(reverseGeocodeTimeoutRef.current);
        }
        reverseGeocodeTimeoutRef.current = setTimeout(() => {
          fetchAddressForCoords(center.lat, center.lng);
        }, 300);
      });

      mapInstanceRef.current = map;

      // Initial reverse geocode if no initial address provided
      if (!initialAddress) {
        fetchAddressForCoords(defaultLat, defaultLng);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (reverseGeocodeTimeoutRef.current) clearTimeout(reverseGeocodeTimeoutRef.current);
    };
  }, [defaultLat, defaultLng, initialAddress, fetchAddressForCoords]);

  // Handle GPS button click
  const handleLocateMe = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentCoords({ lat: latitude, lng: longitude });

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 17, {
            animate: true,
            duration: 1.2,
          });
        }
        fetchAddressForCoords(latitude, longitude);
        setIsLocatingGPS(false);
      },
      (err) => {
        console.warn('GPS location error:', err);
        setIsLocatingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  // Debounced search query
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await fetch(`/api/geocode?query=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
            setSuggestions(data.suggestions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  // Handle selecting a suggested address
  const handleSelectSuggestion = async (s: Suggestion) => {
    setShowSuggestions(false);
    setSearchQuery('');

    let lat = s.lat;
    let lng = s.lng;
    let fullAddr = s.fullAddress;

    // If Google Place prediction without coordinates, resolve via placeId
    if ((lat === undefined || lng === undefined) && s.id) {
      try {
        const res = await fetch(`/api/geocode?placeId=${encodeURIComponent(s.id)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.latitude && data.longitude) {
            lat = data.latitude;
            lng = data.longitude;
            fullAddr = data.formattedAddress || fullAddr;
          }
        }
      } catch {}
    }

    if (lat !== undefined && lng !== undefined) {
      setCurrentCoords({ lat, lng });
      setCurrentAddress(fullAddr);

      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([lat, lng], 17, {
          animate: true,
          duration: 1.2,
        });
      }
      fetchAddressForCoords(lat, lng);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Interactive Map Canvas Container */}
      <div className="relative w-full h-[360px] sm:h-[400px] overflow-hidden rounded-2xl bg-gray-100 shadow-inner">
        {/* Leaflet Map DOM Root */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Custom Zoom Controls (Top-Left) */}
        <div className="absolute top-4 left-4 z-[400] flex flex-col bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-8 h-8 flex items-center justify-center text-lg font-bold text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition cursor-pointer border-b border-gray-100"
            title="Zoom In"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-8 h-8 flex items-center justify-center text-lg font-bold text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition cursor-pointer"
            title="Zoom Out"
          >
            −
          </button>
        </div>

        {/* Floating Search Bar (Top-Center) */}
        <div className="absolute top-4 left-16 right-16 z-[400]">
          <div className="relative w-full max-w-md mx-auto">
            <div className="relative flex items-center bg-white rounded-full shadow-lg border border-gray-200/80 overflow-hidden px-4 py-2.5">
              <input
                type="text"
                placeholder="Enter text to search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                className="w-full bg-transparent text-xs sm:text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none pr-7"
              />
              <span className="absolute right-3.5 text-gray-400">
                {isSearching ? (
                  <div className="h-4 w-4 border-2 border-[#F15B25] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                )}
              </span>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-56 overflow-y-auto divide-y divide-gray-100 z-[500] animate-in fade-in zoom-in-95">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-orange-50/80 transition flex items-start gap-2.5 cursor-pointer group"
                  >
                    <span className="text-base text-[#F15B25] mt-0.5">📍</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-gray-900 truncate">
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] text-gray-500 truncate">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live GPS Crosshairs Target Button (Top-Right) */}
        <div className="absolute top-4 right-4 z-[400]">
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocatingGPS}
            className="w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200/80 flex items-center justify-center hover:scale-105 active:scale-95 transition cursor-pointer group disabled:opacity-60"
            title="Locate my exact position"
          >
            {isLocatingGPS ? (
              <div className="h-5 w-5 border-2 border-[#E63946] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="w-6 h-6 text-[#E63946] group-hover:scale-110 transition-transform"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="7" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
                <line x1="12" y1="2" x2="12" y2="5" strokeWidth={2.5} strokeLinecap="round" />
                <line x1="12" y1="19" x2="12" y2="22" strokeWidth={2.5} strokeLinecap="round" />
                <line x1="2" y1="12" x2="5" y2="12" strokeWidth={2.5} strokeLinecap="round" />
                <line x1="19" y1="12" x2="22" y2="12" strokeWidth={2.5} strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>

        {/* Center Stationary Location Pin Marker (with lift/drop animation) */}
        <div
          className={`absolute left-1/2 top-1/2 pointer-events-none z-[400] transition-all duration-200 ${
            isMapMoving
              ? '-translate-x-1/2 -translate-y-[120%] scale-110'
              : '-translate-x-1/2 -translate-y-full scale-100'
          }`}
        >
          {/* Red Location Pin */}
          <div className="relative flex flex-col items-center">
            <svg
              className="w-9 h-9 text-[#E63946] drop-shadow-[0_6px_6px_rgba(0,0,0,0.35)] filter"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 7 13 8 16 1-3 8-10.75 8-16 0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
            </svg>
            {/* Ground Pinpoint Dot */}
            <div
              className={`h-2 w-3.5 bg-black/35 rounded-full blur-[1px] -mt-1 transition-all ${
                isMapMoving ? 'scale-75 opacity-40' : 'scale-100 opacity-90'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Bottom Address Confirmation Bar (Matching Cheezious Layout) */}
      <div className="mt-3.5 p-3 sm:p-4 bg-white rounded-2xl border border-gray-200/90 shadow-xs flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: App Map Icon */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-emerald-400 to-amber-300 p-0.5 shadow-xs shrink-0 flex items-center justify-center">
          <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center overflow-hidden relative">
            <svg
              className="w-7 h-7 text-[#007AFF]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <polygon
                points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"
                fill="#E8F1FF"
                stroke="#007AFF"
              />
              <line x1="9" y1="3" x2="9" y2="18" stroke="#007AFF" strokeWidth={1.5} />
              <line x1="15" y1="6" x2="15" y2="21" stroke="#007AFF" strokeWidth={1.5} />
              <circle cx="12" cy="11" r="3" fill="#E63946" stroke="#ffffff" strokeWidth={1.5} />
            </svg>
          </div>
        </div>

        {/* Middle: Detected Human-Readable Address */}
        <div className="flex-1 min-w-0">
          <div className="text-xs sm:text-sm font-bold text-gray-900 leading-snug line-clamp-2">
            {isLoadingAddress ? (
              <span className="inline-flex items-center gap-1.5 text-gray-500 font-medium">
                <span className="h-3 w-3 border-2 border-[#F15B25] border-t-transparent rounded-full animate-spin" />
                Detecting exact address...
              </span>
            ) : (
              currentAddress
            )}
          </div>
          {nearestBranch && (
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1.5">
              <span>Serving Kitchen:</span>
              <strong className="text-gray-900">{nearestBranch.name}</strong>
              {nearestBranch.distanceKm !== undefined && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                  {nearestBranch.distanceKm} km
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: Cheezious Yellow SELECT Button */}
        <button
          type="button"
          onClick={() =>
            onSelect(currentAddress, {
              lat: currentCoords.lat,
              lng: currentCoords.lng,
              nearestBranch,
            })
          }
          className="shrink-0 px-6 sm:px-8 py-3 bg-[#FFE600] hover:bg-[#FFD700] active:scale-95 text-black font-black text-xs sm:text-sm tracking-wider uppercase rounded-xl shadow-sm transition-all cursor-pointer"
        >
          SELECT
        </button>
      </div>
    </div>
  );
}
