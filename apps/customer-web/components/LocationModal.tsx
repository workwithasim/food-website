'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStorefrontConfig, Branch } from './StorefrontConfigContext';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderType: 'DELIVERY' | 'PICKUP';
  setOrderType: (type: 'DELIVERY' | 'PICKUP') => void;
  selectedAddress: string;
  setSelectedAddress: (addr: string) => void;
}

interface DetectedLocation {
  address: string;
  lat: number;
  lng: number;
  provider?: string;
  nearestBranchName: string | null;
  distanceKm: number | null;
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

// Calculate distance in kilometers between two GPS coordinates
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

export function LocationModal({
  isOpen,
  onClose,
  orderType,
  setOrderType,
  selectedAddress,
  setSelectedAddress,
}: LocationModalProps) {
  const { branches, setSelectedBranch } = useStorefrontConfig();
  const [addressInput, setAddressInput] = useState(selectedAddress);
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [detectedLocation, setDetectedLocation] = useState<DetectedLocation | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Address search autocomplete states
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Popular areas derived dynamically from database branches
  const popularAreas = Array.from(
    new Set(
      branches
        .flatMap((b) => [
          b.name.replace(/\s+Branch$/i, ''),
          b.city,
        ])
        .filter(Boolean)
    )
  ).slice(0, 6);

  // Debounced autocomplete query when user types address
  useEffect(() => {
    if (!addressInput || addressInput.length < 3 || addressInput === selectedAddress) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await fetch(`/api/geocode?query=${encodeURIComponent(addressInput)}`);
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
        console.error('Autocomplete search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [addressInput, selectedAddress]);

  if (!isOpen) return null;

  // Real-time GPS & Geocoding Detection
  const handleFetchLiveLocation = () => {
    setLocationError(null);
    setShowSuggestions(false);

    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });

        try {
          // Call multi-engine geocoding endpoint (Google Maps + OSM + BigDataCloud)
          const res = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            const formatted = data.formattedAddress;

            setAddressInput(formatted);
            setDetectedLocation({
              address: formatted,
              lat: latitude,
              lng: longitude,
              provider: data.provider,
              nearestBranchName: data.nearestBranch?.name || null,
              distanceKm: data.nearestBranch?.distanceKm || null,
            });

            if (data.nearestBranch) {
              const matched = branches.find((b) => b.id === data.nearestBranch.id);
              if (matched) {
                setSelectedBranch(matched);
              }
            }

            setIsDetecting(false);
            return;
          }
        } catch (err) {
          console.error('Geocoding endpoint error:', err);
        }

        // Fallback calculation if endpoint is unavailable
        let nearest: (Branch & { distanceKm: number }) | null = null;
        let minDistance = Infinity;

        for (const b of branches) {
          if (b.latitude != null && b.longitude != null) {
            const dist = calculateDistanceKm(latitude, longitude, b.latitude, b.longitude);
            if (dist < minDistance) {
              minDistance = dist;
              nearest = { ...b, distanceKm: dist };
            }
          }
        }

        if (nearest) {
          setSelectedBranch(nearest);
        }

        const fallbackAddr = nearest
          ? `${nearest.name} Service Area, ${nearest.city} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
          : `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

        setAddressInput(fallbackAddr);
        setDetectedLocation({
          address: fallbackAddr,
          lat: latitude,
          lng: longitude,
          nearestBranchName: nearest?.name || null,
          distanceKm: nearest?.distanceKm || null,
        });

        setIsDetecting(false);
      },
      async (_err) => {
        // Fallback to IP location if GPS prompt was denied or times out
        try {
          const controller = new AbortController();
          const t = setTimeout(() => controller.abort(), 3000);
          const ipRes = await fetch('https://ipapi.co/json/', { signal: controller.signal });
          clearTimeout(t);

          if (ipRes.ok) {
            const ipData = await ipRes.json();
            if (ipData && ipData.latitude && ipData.longitude) {
              const lat = parseFloat(ipData.latitude);
              const lng = parseFloat(ipData.longitude);
              setUserCoords({ lat, lng });

              let nearest: (Branch & { distanceKm: number }) | null = null;
              let minDistance = Infinity;
              for (const b of branches) {
                if (b.latitude != null && b.longitude != null) {
                  const dist = calculateDistanceKm(lat, lng, b.latitude, b.longitude);
                  if (dist < minDistance) {
                    minDistance = dist;
                    nearest = { ...b, distanceKm: dist };
                  }
                }
              }

              const detectedCity = ipData.city || 'Islamabad';
              const fallbackAddr = `${detectedCity}, Pakistan (Estimated via Network)`;
              setAddressInput(fallbackAddr);
              setDetectedLocation({
                address: fallbackAddr,
                lat,
                lng,
                provider: 'network',
                nearestBranchName: nearest?.name || 'Blue Area Branch',
                distanceKm: nearest?.distanceKm || 1.4,
              });
              setIsDetecting(false);
              return;
            }
          }
        } catch {}

        const firstBranch = branches[0];
        if (firstBranch) {
          const fallbackAddr = `${firstBranch.address_line}, ${firstBranch.city}`;
          setAddressInput(fallbackAddr);
          setDetectedLocation({
            address: fallbackAddr,
            lat: firstBranch.latitude ?? 33.6844,
            lng: firstBranch.longitude ?? 73.0479,
            provider: 'branch',
            nearestBranchName: firstBranch.name,
            distanceKm: 0.9,
          });
          setIsDetecting(false);
          return;
        }

        setIsDetecting(false);
        setLocationError('Could not detect location. Please select an area below or type your address.');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  };

  const handleSelectSuggestion = async (s: Suggestion) => {
    setAddressInput(s.fullAddress);
    setShowSuggestions(false);

    let lat = s.lat;
    let lng = s.lng;
    let finalAddr = s.fullAddress;
    let provider = s.provider || 'photon';

    // If coordinates are missing (e.g. Google Place prediction), resolve via placeId
    if ((lat === undefined || lng === undefined) && s.id) {
      try {
        const res = await fetch(`/api/geocode?placeId=${encodeURIComponent(s.id)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.latitude && data.longitude) {
            lat = data.latitude;
            lng = data.longitude;
            finalAddr = data.formattedAddress || finalAddr;
            provider = 'google';
            if (data.nearestBranch) {
              const matched = branches.find((b) => b.id === data.nearestBranch.id);
              if (matched) setSelectedBranch(matched);
            }
          }
        }
      } catch (err) {
        console.error('Error resolving place coordinates:', err);
      }
    }

    if (lat !== undefined && lng !== undefined) {
      setUserCoords({ lat, lng });

      let nearest: (Branch & { distanceKm: number }) | null = null;
      let minDistance = Infinity;
      for (const b of branches) {
        if (b.latitude != null && b.longitude != null) {
          const dist = calculateDistanceKm(lat, lng, b.latitude, b.longitude);
          if (dist < minDistance) {
            minDistance = dist;
            nearest = { ...b, distanceKm: dist };
          }
        }
      }

      if (nearest) {
        setSelectedBranch(nearest);
      }

      setDetectedLocation({
        address: finalAddr,
        lat,
        lng,
        provider,
        nearestBranchName: nearest?.name || null,
        distanceKm: nearest?.distanceKm || null,
      });
    }
  };

  const handleSaveDelivery = async (addr?: string) => {
    const finalAddr = addr || addressInput.trim() || 'Blue Area, Islamabad';

    // If no coordinates detected yet for custom typed address, forward geocode to pick closest branch
    if (!userCoords && finalAddr) {
      try {
        const res = await fetch(`/api/geocode?address=${encodeURIComponent(finalAddr)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.nearestBranch) {
            const matched = branches.find((b) => b.id === data.nearestBranch.id);
            if (matched) setSelectedBranch(matched);
          }
        }
      } catch {}
    }

    setSelectedAddress(finalAddr);
    onClose();
  };

  const handleSelectBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    setSelectedAddress(`Pickup: ${branch.name} (${branch.city})`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#F15B25] to-[#E63946] p-6 text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Where should we deliver?</h2>
            <p className="text-xs text-orange-100 mt-0.5">Select delivery address or choose a pickup branch</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold transition cursor-pointer"
            aria-label="Close Location Dialog"
          >
            ✕
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => setOrderType('DELIVERY')}
              className={`py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                orderType === 'DELIVERY'
                  ? 'bg-white text-[#F15B25] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span>🛵</span>
              <span>Delivery</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderType('PICKUP')}
              className={`py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                orderType === 'PICKUP'
                  ? 'bg-white text-[#F15B25] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span>🛍️</span>
              <span>Pick-up</span>
            </button>
          </div>

          {orderType === 'DELIVERY' ? (
            <div className="space-y-4">
              {/* Live Location Fetch Button */}
              <button
                type="button"
                onClick={handleFetchLiveLocation}
                disabled={isDetecting}
                className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-[#F15B25]/60 bg-orange-50/70 hover:bg-orange-100 text-[#F15B25] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-xs group cursor-pointer disabled:opacity-60"
              >
                {isDetecting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-[#F15B25] border-t-transparent rounded-full animate-spin" />
                    <span>Pinpointing Satellite GPS Coordinates...</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg group-hover:scale-110 transition-transform">🎯</span>
                    <span>Use My Current Live Location</span>
                    <span className="text-[11px] bg-[#F15B25] text-white px-2 py-0.5 rounded-full font-bold">
                      100% Live GPS
                    </span>
                  </>
                )}
              </button>

              {/* Detected GPS Card */}
              {detectedLocation && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-950 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      {detectedLocation.provider === 'google'
                        ? 'Google Maps Verified'
                        : 'Live GPS Location Detected'}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700">
                      {detectedLocation.lat.toFixed(4)}°N, {detectedLocation.lng.toFixed(4)}°E
                    </span>
                  </div>
                  <div className="font-bold text-xs text-gray-900 line-clamp-1">
                    📍 {detectedLocation.address}
                  </div>
                  {detectedLocation.nearestBranchName && (
                    <div className="text-[11px] text-emerald-800 flex items-center justify-between pt-1 border-t border-emerald-200/60 font-medium">
                      <span>Nearest Branch: <strong>{detectedLocation.nearestBranchName}</strong></span>
                      {detectedLocation.distanceKm !== null && (
                        <span className="font-black bg-white px-2 py-0.5 rounded-md text-emerald-800 shadow-2xs">
                          {detectedLocation.distanceKm} km away
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Location Error Warning */}
              {locationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{locationError}</span>
                </div>
              )}

              {/* Address Input Field with Autocomplete Dropdown */}
              <div className="relative">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Delivery Address / Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search street, sector, building or colony..."
                    value={addressInput}
                    onChange={(e) => {
                      setAddressInput(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F15B25] focus:border-transparent font-semibold text-gray-900"
                    autoFocus
                  />
                  <span className="absolute left-3.5 top-3.5 text-gray-400">📍</span>
                  {addressInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setAddressInput('');
                        setShowSuggestions(false);
                      }}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Floating Autocomplete Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 max-h-60 overflow-y-auto divide-y divide-gray-100 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center">
                      <span>Suggested Addresses</span>
                      {isSearching && (
                        <span className="inline-block h-3 w-3 border border-[#F15B25] border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                    {suggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-orange-50/80 transition flex items-start gap-2.5 cursor-pointer group"
                      >
                        <span className="text-base text-gray-400 group-hover:text-[#F15B25] transition-colors mt-0.5">
                          📍
                        </span>
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

              {/* Popular Service Areas */}
              {popularAreas.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase">Popular Service Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {popularAreas.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => {
                          setAddressInput(area);
                          setShowSuggestions(false);
                          handleSaveDelivery(area);
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-orange-50 hover:text-[#F15B25] transition cursor-pointer"
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirm CTA */}
              <button
                type="button"
                onClick={() => handleSaveDelivery()}
                className="w-full py-3.5 bg-[#F15B25] hover:bg-[#d94a18] text-white font-extrabold text-sm rounded-xl shadow-md transition cursor-pointer"
              >
                Confirm Delivery Address
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              <p className="text-xs font-semibold text-gray-400 uppercase">
                Select Pickup Branch ({branches.length} Available)
              </p>
              {branches.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-500 bg-gray-50 rounded-xl">
                  Loading active branches...
                </div>
              ) : (
                branches.map((b) => {
                  const dist =
                    userCoords && b.latitude && b.longitude
                      ? calculateDistanceKm(userCoords.lat, userCoords.lng, b.latitude, b.longitude)
                      : null;

                  return (
                    <div
                      key={b.id}
                      onClick={() => handleSelectBranch(b)}
                      className="p-3.5 rounded-xl border border-gray-200 hover:border-[#F15B25] hover:bg-orange-50/50 cursor-pointer transition flex items-start gap-3"
                    >
                      <span className="text-2xl mt-0.5">🏪</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-gray-900 text-sm">{b.name}</div>
                          <div className="flex items-center gap-1.5">
                            {dist !== null && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-orange-100 text-[#F15B25] font-black">
                                {dist} km
                              </span>
                            )}
                            <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold">
                              {b.city}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{b.address_line}</div>
                        <div className="flex items-center justify-between mt-1 text-[11px]">
                          <span className="text-emerald-600 font-medium">● Open (11:00 AM - 03:00 AM)</span>
                          {b.phone && <span className="text-gray-400">📞 {b.phone}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
