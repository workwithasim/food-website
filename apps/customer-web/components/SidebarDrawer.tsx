'use client';

import React from 'react';
import Link from 'next/link';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export function SidebarDrawer({ isOpen, onClose, onOpenAuth }: SidebarDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
        {/* Header Profile / Login Banner */}
        <div className="bg-gradient-to-br from-[#F15B25] to-[#E63946] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold transition"
            aria-label="Close Sidebar"
          >
            ✕
          </button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white text-[#F15B25] font-black text-2xl flex items-center justify-center shadow-md">
              C
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight">Cheezious</div>
              <div className="text-xs text-orange-100 font-medium">World of Cheezy Treats</div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/20">
            <p className="text-xs text-white/90 mb-2">Login to enjoy faster ordering & view order history</p>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="w-full py-2 bg-[#FFC107] hover:bg-[#e0a800] text-gray-900 font-bold rounded-lg text-sm shadow-sm transition"
            >
              Login / Sign Up
            </button>
          </div>
        </div>

        {/* Links Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-orange-50 text-gray-800 font-bold text-sm transition"
          >
            <span className="text-lg">🍕</span>
            <span>Explore Menu</span>
          </Link>
          <Link
            href="/#pizza-deals"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-orange-50 text-gray-800 font-bold text-sm transition"
          >
            <span className="text-lg">🔥</span>
            <span>Special Pizza Deals</span>
          </Link>
          <Link
            href="/orders"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-orange-50 text-gray-800 font-bold text-sm transition"
          >
            <span className="text-lg">🚚</span>
            <span>Track Your Order</span>
          </Link>
          <Link
            href="/#somewhat-local"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-orange-50 text-gray-800 font-bold text-sm transition"
          >
            <span className="text-lg">🌶️</span>
            <span>Somewhat Local Special</span>
          </Link>
          <Link
            href="/#burgers"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-orange-50 text-gray-800 font-bold text-sm transition"
          >
            <span className="text-lg">🍔</span>
            <span>Bazinga Burgers</span>
          </Link>

          <div className="pt-4 mt-4 border-t border-gray-100">
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-xs transition"
            >
              <span>Restaurant Admin (Ops)</span>
              <span>↗</span>
            </a>
          </div>
        </nav>

        {/* Footer Support Hotline */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
          <p className="text-xs text-gray-500 mb-1">Need help or want to order by phone?</p>
          <a
            href="tel:051111446699"
            className="inline-flex items-center justify-center gap-2 font-black text-[#F15B25] text-base hover:underline"
          >
            <span>📞</span>
            <span>051 111 446 699</span>
          </a>
        </div>
      </div>
    </div>
  );
}
