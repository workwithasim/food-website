'use client';

import React, { useState } from 'react';
import { Button } from '@restaurant/ui';
import { LocationSelector } from './LocationSelector';
import { AuthDialog } from './AuthDialog';
import { MobileNav } from './MobileNav';
import Link from 'next/link';

export function Header() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden" 
            onClick={() => setIsNavOpen(true)}
            aria-label="Open Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
          
          <Link href="/" className="text-xl font-bold tracking-tight text-rose-600">
            BrandFood
          </Link>

          <nav className="hidden md:flex items-center gap-6 ml-6">
            <Link href="/" className="text-sm font-medium hover:text-rose-600">Menu</Link>
            <Link href="/deals" className="text-sm font-medium hover:text-rose-600">Deals</Link>
            <Link href="/orders" className="text-sm font-medium hover:text-rose-600">Orders</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <LocationSelector />
          </div>
          
          <Button variant="outline" onClick={() => setIsAuthOpen(true)}>
            Sign In
          </Button>
          
          <Button variant="primary">
            Cart (0)
          </Button>
        </div>
      </div>

      <AuthDialog isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <MobileNav isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
    </header>
  );
}
