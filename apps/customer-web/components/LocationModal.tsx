'use client';

import React, { useState } from 'react';

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
  const [addressInput, setAddressInput] = useState(selectedAddress);

  const branches = [
    { id: '1', name: 'Main Branch - Central', address: '123 Food Street, Blue Area, Islamabad', time: '11:00 AM - 03:00 AM' },
    { id: '2', name: 'F-7 Markaz Express', address: 'Shop 4, Gol Market, F-7/3, Islamabad', time: '11:00 AM - 04:00 AM' },
    { id: '3', name: 'Rawalpindi Saddar Branch', address: 'Haider Road, Saddar, Rawalpindi', time: '11:00 AM - 03:00 AM' },
    { id: '4', name: 'Bahria Town Phase 4', address: 'Civic Center, Bahria Town, Rawalpindi', time: '12:00 PM - 03:00 AM' },
  ];

  if (!isOpen) return null;

  const handleSave = (addr?: string) => {
    const finalAddr = addr || addressInput.trim() || 'Blue Area, Islamabad';
    setSelectedAddress(finalAddr);
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

              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase">Popular Delivery Areas</p>
                <div className="flex flex-wrap gap-2">
                  {['F-7, Islamabad', 'F-10 Markaz', 'Blue Area', 'Bahria Phase 4', 'Saddar, Rawalpindi'].map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => handleSave(area)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-orange-50 hover:text-[#F15B25] transition"
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSave()}
                className="w-full py-3.5 bg-[#F15B25] hover:bg-[#d94a18] text-white font-bold rounded-xl shadow-md transition"
              >
                Confirm Delivery Address
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              <p className="text-xs font-semibold text-gray-400 uppercase">Select Pickup Branch</p>
              {branches.map((b) => (
                <div
                  key={b.id}
                  onClick={() => handleSave(`Pickup: ${b.name}`)}
                  className="p-3.5 rounded-xl border border-gray-200 hover:border-[#F15B25] hover:bg-orange-50/50 cursor-pointer transition flex items-start gap-3"
                >
                  <span className="text-2xl mt-0.5">🏪</span>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-sm">{b.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{b.address}</div>
                    <div className="text-[11px] text-emerald-600 font-medium mt-1">● Open ({b.time})</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
