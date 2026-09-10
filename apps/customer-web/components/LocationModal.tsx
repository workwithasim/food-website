'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useStorefrontConfig, Branch } from './StorefrontConfigContext';

// Dynamically import Leaflet MapPicker without SSR
const MapPicker = dynamic(() => import('./MapPicker'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[360px] sm:h-[400px] rounded-2xl bg-gray-100 animate-pulse flex flex-col items-center justify-center gap-3 text-gray-400">
      <div className="h-8 w-8 border-3 border-[#F15B25] border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-bold text-gray-500">Initializing Live Interactive Map...</span>
    </div>
  ),
});

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderType: 'DELIVERY' | 'PICKUP';
  setOrderType: (type: 'DELIVERY' | 'PICKUP') => void;
  selectedAddress: string;
  setSelectedAddress: (addr: string) => void;
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
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  if (!isOpen) return null;

  // Confirmation when user clicks "SELECT" on the live map
  const handleSelectDeliveryAddress = (
    address: string,
    details?: { lat: number; lng: number; nearestBranch?: any }
  ) => {
    const finalAddr = address || 'Blue Area, Islamabad';
    setSelectedAddress(finalAddr);

    if (details?.lat && details?.lng) {
      setUserCoords({ lat: details.lat, lng: details.lng });
    }

    if (details?.nearestBranch) {
      const matched = branches.find((b) => b.id === details.nearestBranch.id);
      if (matched) {
        setSelectedBranch(matched);
      }
    }
    onClose();
  };

  const handleSelectBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    setSelectedAddress(`Pickup: ${branch.name} (${branch.city})`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header - Matching User Screenshot */}
        <div className="p-5 sm:p-6 pb-3 flex items-start justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Enter Address
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
              Please allow location for free delivery and good food experience.
            </p>
          </div>
          {/* Red Circular Close Button matching user screenshot */}
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-[#E63946] hover:bg-[#D90429] active:scale-95 text-white flex items-center justify-center font-bold text-sm transition-all shadow-sm cursor-pointer shrink-0 ml-3"
            aria-label="Close Location Dialog"
          >
            ✕
          </button>
        </div>

        {/* Order Mode Toggle: Delivery / Pick-up */}
        <div className="px-5 sm:px-6 mb-3">
          <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => setOrderType('DELIVERY')}
              className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                orderType === 'DELIVERY'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span>🛵</span>
              <span>Delivery</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderType('PICKUP')}
              className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                orderType === 'PICKUP'
                  ? 'bg-white text-[#F15B25] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span>🛍️</span>
              <span>Pick-up</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-5 sm:px-6 pb-6">
          {orderType === 'DELIVERY' ? (
            <MapPicker
              initialAddress={selectedAddress}
              onSelect={handleSelectDeliveryAddress}
              onLocationChange={(loc) => {
                setUserCoords({ lat: loc.lat, lng: loc.lng });
              }}
            />
          ) : (
            /* Pick-up Branch List with distances */
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
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
