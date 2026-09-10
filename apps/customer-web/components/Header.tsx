'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from './CartProvider';
import { LocationModal } from './LocationModal';
import { SidebarDrawer } from './SidebarDrawer';
import { AuthDialog } from './AuthDialog';

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export function Header({ onSearch, searchQuery = '' }: HeaderProps) {
  const { cart, setSidebarOpen } = useCart();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [orderType, setOrderType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [selectedAddress, setSelectedAddress] = useState('Blue Area, Islamabad');

  const cartItemCount = cart?.items?.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) || 0;
  const cartSubtotal = cart?.items?.reduce((acc: number, item: any) => {
    const base = item.variant?.price_minor ?? item.product?.base_price_minor ?? 0;
    const mods = (item.modifiers || []).reduce((mAcc: number, m: any) => {
      const delta = m.modifier?.price_delta_minor ?? m.price_delta_minor ?? 0;
      return mAcc + Number(delta);
    }, 0);
    return acc + ((Number(base) + mods) * (item.quantity || 1));
  }, 0) || 0;

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 gap-3 sm:gap-4">
          {/* Left: Drawer Toggle & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-xl text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-full bg-[#F15B25] text-white flex items-center justify-center font-black text-xl shadow-xs group-hover:scale-105 transition">
                C
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-black tracking-tight text-gray-950">Cheezious</span>
              </div>
            </Link>
          </div>

          {/* Middle: Order Type Toggle & Address Selector */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Delivery / Pickup Switch */}
            <div className="flex items-center p-1 bg-gray-100 rounded-full text-xs font-extrabold">
              <button
                onClick={() => setOrderType('DELIVERY')}
                className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                  orderType === 'DELIVERY'
                    ? 'bg-[#F15B25] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>🛵</span>
                <span>Delivery</span>
              </button>
              <button
                onClick={() => setOrderType('PICKUP')}
                className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                  orderType === 'PICKUP'
                    ? 'bg-[#F15B25] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>🛍️</span>
                <span>Pick-up</span>
              </button>
            </div>

            {/* Address / Location Pill */}
            <button
              onClick={() => setIsLocationOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 bg-white text-xs font-bold text-gray-800 shadow-xs max-w-xs truncate transition"
            >
              <span className="text-[#F15B25]">📍</span>
              <span className="truncate">{selectedAddress}</span>
              <span className="text-gray-400 text-[10px]">▼</span>
            </button>
          </div>

          {/* Search Bar */}
          {onSearch && (
            <div className="flex-1 max-w-xs sm:max-w-sm relative hidden md:block">
              <input
                type="text"
                placeholder="Find in Cheezious menu..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full text-xs sm:text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F15B25] focus:border-transparent transition"
              />
              <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
            </div>
          )}

          {/* Right: Cart and Login */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Address Button */}
            <button
              onClick={() => setIsLocationOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 text-sm"
              title="Change address"
            >
              📍
            </button>

            {/* Login Button */}
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm text-gray-800 hover:bg-gray-100 transition flex items-center gap-1.5"
            >
              <span>👤</span>
              <span className="hidden sm:inline">Login</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#FFC107] hover:bg-[#e0a800] text-gray-950 font-black text-xs sm:text-sm shadow-xs hover:shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <span>🛒</span>
              <span>Cart</span>
              {cartSubtotal > 0 && (
                <span className="hidden sm:inline text-xs font-bold text-gray-800">
                  | PKR {(cartSubtotal / 100).toLocaleString()}
                </span>
              )}
              {cartItemCount > 0 && (
                <span className="h-5 px-1.5 rounded-full bg-[#F15B25] text-white text-[11px] font-black flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Modals & Drawers */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <LocationModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        orderType={orderType}
        setOrderType={setOrderType}
        selectedAddress={selectedAddress}
        setSelectedAddress={setSelectedAddress}
      />

      <AuthDialog
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </>
  );
}
