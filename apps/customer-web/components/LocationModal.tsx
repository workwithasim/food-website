'use client';

import React, { useState } from 'react';
import { useStorefrontConfig, Branch } from './StorefrontConfigContext';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderType: 'DELIVERY' | 'PICKUP';
  setOrderType: (type: 'DELIVERY' | 'PICKUP') => void;
  selectedAddress: string;
  setSelectedAddress: (addr: string) => void;
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

  if (!isOpen) return null;

  // Derive popular areas dynamically from branch locations
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

  const handleSaveDelivery = (addr?: string) => {
    const finalAddr = addr || addressInput.trim() || 'Blue Area, Islamabad';
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
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#F15B25] to-[#E63946] p-6 text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Where should we deliver?</h2>
            <p className="text-xs text-orange-100 mt-0.5">Select delivery address or choose a pickup branch</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold transition"
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
              className={`py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
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
              className={`py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
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
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Delivery Address / Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter your street, sector, or apartment..."
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F15B25] focus:border-transparent font-medium"
                    autoFocus
                  />
                  <span className="absolute left-3.5 top-3.5 text-gray-400">📍</span>
                </div>
              </div>

              {popularAreas.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase">Popular Service Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {popularAreas.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => handleSaveDelivery(area)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-orange-50 hover:text-[#F15B25] transition"
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => handleSaveDelivery()}
                className="w-full py-3.5 bg-[#F15B25] hover:bg-[#d94a18] text-white font-bold rounded-xl shadow-md transition"
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
                branches.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => handleSelectBranch(b)}
                    className="p-3.5 rounded-xl border border-gray-200 hover:border-[#F15B25] hover:bg-orange-50/50 cursor-pointer transition flex items-start gap-3"
                  >
                    <span className="text-2xl mt-0.5">🏪</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-gray-900 text-sm">{b.name}</div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold">
                          {b.city}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{b.address_line}</div>
                      <div className="flex items-center justify-between mt-1 text-[11px]">
                        <span className="text-emerald-600 font-medium">● Open (11:00 AM - 03:00 AM)</span>
                        {b.phone && <span className="text-gray-400">📞 {b.phone}</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
