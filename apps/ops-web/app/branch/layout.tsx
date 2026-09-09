'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function BranchLayout({ children }: { children: React.ReactNode }) {
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  const togglePause = () => {
    const nextState = !isAcceptingOrders;
    setIsAcceptingOrders(nextState);
    const msg = nextState 
      ? 'Branch is now ONLINE and accepting customer orders.' 
      : 'EMERGENCY PAUSE: Branch is paused. No new orders accepted.';
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-2.5 rounded-lg shadow-xl text-sm font-semibold border ${
          isAcceptingOrders 
            ? 'bg-emerald-900 text-white border-emerald-700' 
            : 'bg-red-900 text-white border-red-700'
        }`}>
          {notification}
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-900 text-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">Central Branch</h1>
            <span className={`h-2.5 w-2.5 rounded-full ${isAcceptingOrders ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Branch Manager Console</p>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <Link href="/branch" className="block px-3 py-2 rounded-md hover:bg-gray-800 text-sm font-medium text-gray-200 hover:text-white">
            📊 Branch Overview
          </Link>
          <Link href="/branch/live-orders" className="block px-3 py-2 rounded-md hover:bg-gray-800 text-sm font-medium text-gray-200 hover:text-white">
            📋 Live Orders
          </Link>
          <Link href="/branch/inventory" className="block px-3 py-2 rounded-md hover:bg-gray-800 text-sm font-medium text-gray-200 hover:text-white">
            📦 Inventory Controls
          </Link>
          
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Operations</p>
          </div>
          <Link href="/branch/riders" className="block px-3 py-2 rounded-md hover:bg-gray-800 text-sm font-medium text-gray-200 hover:text-white">
            🛵 Riders & Dispatch
          </Link>
          <Link href="/branch/settlements" className="block px-3 py-2 rounded-md hover:bg-gray-800 text-sm font-medium text-gray-200 hover:text-white">
            💵 COD Settlements
          </Link>
          <Link href="/kds" className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-800 text-sm font-medium text-emerald-400">
            <span>👨‍🍳 Kitchen (KDS)</span>
            <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">Live</span>
          </Link>
          <a href="http://localhost:3002" target="_blank" rel="noreferrer" className="block px-3 py-2 rounded-md hover:bg-gray-800 text-sm font-medium text-blue-400">
            🛒 Customer Store ↗
          </a>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link 
            href="/dashboard" 
            className="w-full flex items-center justify-center px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-sm font-semibold text-blue-400 hover:text-blue-300 transition"
          >
            ← Switch to Admin
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 justify-between shadow-sm">
          <div className="font-medium text-gray-700 flex items-center space-x-2">
            <span className={`h-2.5 w-2.5 rounded-full ${isAcceptingOrders ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            <span className="font-semibold">{isAcceptingOrders ? 'Accepting Orders' : 'Store Paused'}</span>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={togglePause}
              className={`px-3.5 py-1.5 border rounded-lg text-xs font-bold transition ${
                isAcceptingOrders 
                  ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100' 
                  : 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
              }`}
            >
              {isAcceptingOrders ? '⚠️ Emergency Pause' : '▶ Resume Orders'}
            </button>
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              BM
            </span>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
