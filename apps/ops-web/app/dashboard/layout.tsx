import Link from 'next/link';
import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Restaurant Admin</h1>
          <p className="text-sm text-gray-500">Ops Web</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link href="/dashboard" className="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm font-medium">Dashboard</Link>
          <Link href="/dashboard/orders" className="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm font-medium">Orders</Link>
          
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu</p>
          </div>
          <Link href="/dashboard/catalog/categories" className="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm font-medium">Categories</Link>
          <Link href="/dashboard/catalog/products" className="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm font-medium">Products</Link>
          <Link href="/dashboard/catalog/modifiers" className="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm font-medium">Modifier Groups</Link>
          
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Operations</p>
          </div>
          <Link href="/dashboard/branches" className="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm font-medium">Branches</Link>
          <Link href="/dashboard/staff" className="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm font-medium">Staff</Link>
          <Link href="/dashboard/settings" className="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm font-medium">Settings</Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-sm font-medium text-red-600">Sign Out</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 justify-between">
          <div className="font-medium text-gray-700">Central Branch</div>
          <div className="flex items-center space-x-4">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
              AD
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
