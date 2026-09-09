import { ReactNode } from 'react';
import Link from 'next/link';

export default function KDSLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* Top Navigation Bar - Designed to be small to maximize screen real estate */}
      <header className="flex-none bg-gray-950 px-6 py-3 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-black text-white tracking-wider">KITCHEN DISPLAY</h1>
          <div className="flex space-x-4 text-sm font-semibold">
            <span className="text-green-400">● Live Connection</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-300">Central Branch</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/branch" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold rounded">
            Exit KDS
          </Link>
        </div>
      </header>
      
      {/* Main KDS Area */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        {children}
      </main>
    </div>
  );
}
