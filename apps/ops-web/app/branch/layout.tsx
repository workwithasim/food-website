import Link from 'next/link';
import React from 'react';

export default function BranchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-900 text-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">Central Branch</h1>
          <p className="text-sm text-gray-400">Manager View</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link href="/branch" className="block px-3 py-2 rounded-md hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white">Dashboard</Link>
          <Link href="/branch/live-orders" className="block px-3 py-2 rounded-md hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white">Live Orders</Link>
          <Link href="/branch/inventory" className="block px-3 py-2 rounded-md hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white">Inventory Controls</Link>
          
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Operations</p>
          </div>
          <Link href="/branch/riders" className="block px-3 py-2 rounded-md hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white">Riders</Link>
          <Link href="/branch/settlements" className="block px-3 py-2 rounded-md hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white">COD Settlements</Link>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-800 text-sm font-medium text-red-400">Switch to Admin</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 justify-between shadow-sm">
          <div className="font-medium text-gray-700 flex items-center">
            <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
            Accepting Orders
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-3 py-1.5 border border-red-300 text-red-700 rounded-md text-sm font-medium hover:bg-red-50">
              Emergency Pause
            </button>
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
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
