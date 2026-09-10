'use client';

import React from 'react';
import Link from 'next/link';
import { useStorefrontConfig, Branch } from './StorefrontConfigContext';

export function Footer() {
  const { config, branches } = useStorefrontConfig();

  const brandName = config.settings?.restaurant_display_name || config.tenant?.name || 'Cheezious';
  const tagline = config.settings?.theme_json?.tagline || 'World of Flavors & Cheezy Treats';
  const hotline = config.settings?.support_phone || config.settings?.theme_json?.hotline || '051 111 446 699';
  const email = config.settings?.support_email || 'support@cheezious.com';
  const logoUrl = config.settings?.theme_json?.logo_url || 'https://cheezious.com/cheezious.svg';
  const footerText = config.settings?.theme_json?.footer_text || 
    'Taste the pure cheesy goodness. From Crown Crust Pizzas to Crispy Bazinga Burgers, we serve quality, passion, and flavor across Pakistan.';
  const copyright = config.settings?.theme_json?.copyright || 
    `© ${new Date().getFullYear()} ${brandName} Pakistan. All Rights Reserved.`;

  const socialLinks = config.settings?.theme_json?.social_links || {
    facebook: 'https://facebook.com/cheezious',
    instagram: 'https://instagram.com/cheeziouspakistan',
    tiktok: 'https://tiktok.com/@cheezious_pk',
  };

  // Group active branches by city
  const branchesByCity = branches.reduce((acc, b) => {
    const city = b.city || 'Other';
    if (!acc[city]) {
      acc[city] = [];
    }
    acc[city].push(b);
    return acc;
  }, {} as Record<string, Branch[]>);

  const cities = Object.keys(branchesByCity);

  return (
    <footer className="bg-gray-950 text-gray-300 border-t border-gray-800 pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Feature Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-gray-800 text-center sm:text-left">
          <div className="flex items-center gap-3.5 justify-center sm:justify-start">
            <span className="text-3xl">🛵</span>
            <div>
              <div className="font-extrabold text-white text-sm">Fast Delivery</div>
              <div className="text-xs text-gray-400">Hot & Fresh in 30-40 mins</div>
            </div>
          </div>
          <div className="flex items-center gap-3.5 justify-center sm:justify-start">
            <span className="text-3xl">🧀</span>
            <div>
              <div className="font-extrabold text-white text-sm">100% Pure Cheese</div>
              <div className="text-xs text-gray-400">Signature Cheezy Goodness</div>
            </div>
          </div>
          <div className="flex items-center gap-3.5 justify-center sm:justify-start">
            <span className="text-3xl">🥩</span>
            <div>
              <div className="font-extrabold text-white text-sm">100% Halal</div>
              <div className="text-xs text-gray-400">Certified Fresh Ingredients</div>
            </div>
          </div>
          <div className="flex items-center gap-3.5 justify-center sm:justify-start">
            <span className="text-3xl">📞</span>
            <div>
              <div className="font-extrabold text-white text-sm">24/7 Support</div>
              <div className="text-xs text-gray-400">UAN: {hotline}</div>
            </div>
          </div>
        </div>

        {/* Main Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Column 1: Brand Info & Description (4 cols) */}
          <div className="md:col-span-4 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2.5">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={brandName} 
                  className="h-9 w-auto max-w-[140px] object-contain"
                  onError={(e) => {
                    // Fallback to stylized badge if logo fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-[#F15B25] text-white flex items-center justify-center font-black text-xl shadow-md">
                  {brandName.charAt(0)}
                </div>
                <span className="text-2xl font-black tracking-tight text-white">{brandName}</span>
              </div>
            </Link>

            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              {footerText}
            </p>

            <div className="text-xs text-orange-400 font-bold uppercase tracking-wider">
              {tagline}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="h-9 w-9 rounded-full bg-gray-800 hover:bg-[#F15B25] text-white flex items-center justify-center transition-colors text-sm font-bold shadow-sm"
                  aria-label="Facebook"
                >
                  fb
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="h-9 w-9 rounded-full bg-gray-800 hover:bg-[#F15B25] text-white flex items-center justify-center transition-colors text-sm font-bold shadow-sm"
                  aria-label="Instagram"
                >
                  ig
                </a>
              )}
              {socialLinks.tiktok && (
                <a
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="h-9 w-9 rounded-full bg-gray-800 hover:bg-[#F15B25] text-white flex items-center justify-center transition-colors text-sm font-bold shadow-sm"
                  aria-label="TikTok"
                >
                  tt
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links & Categories (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-gray-800 pb-2">
              Menu Links
            </h3>
            <ul className="space-y-2.5 text-xs text-gray-400 font-medium">
              <li>
                <Link href="/" className="hover:text-white transition">Explore Full Menu</Link>
              </li>
              <li>
                <Link href="/#pizza-deals" className="hover:text-white transition">Special Pizza Deals</Link>
              </li>
              <li>
                <Link href="/#somewhat-local" className="hover:text-white transition">Somewhat Local</Link>
              </li>
              <li>
                <Link href="/#burgers" className="hover:text-white transition">Bazinga Burgers</Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-[#F15B25] font-bold transition">Track Your Order 🛵</Link>
              </li>
              <li className="pt-2">
                <a 
                  href="http://localhost:3001" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-orange-400 hover:text-orange-300 font-bold transition flex items-center gap-1"
                >
                  <span>Restaurant Ops</span>
                  <span>↗</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Live Dynamic Branches by City (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Our Branches ({branches.length})
              </h3>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Network
              </span>
            </div>

            {branches.length === 0 ? (
              <p className="text-xs text-gray-500">Loading branch locations...</p>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2 no-scrollbar text-xs">
                {cities.map((city) => (
                  <div key={city} className="space-y-2">
                    <span className="inline-block px-2 py-0.5 rounded bg-gray-800 text-orange-400 font-bold text-[10px] uppercase">
                      📍 {city}
                    </span>
                    <div className="grid grid-cols-1 gap-2 pl-1">
                      {(branchesByCity[city] || []).map((branch) => (
                        <div 
                          key={branch.id} 
                          className="bg-gray-900/80 p-2.5 rounded-xl border border-gray-800/80 hover:border-gray-700 transition"
                        >
                          <div className="font-bold text-gray-200 flex items-center justify-between">
                            <span>{branch.name}</span>
                            {branch.phone && (
                              <a 
                                href={`tel:${branch.phone.replace(/\s+/g, '')}`} 
                                className="text-orange-400 hover:underline text-[11px]"
                              >
                                {branch.phone}
                              </a>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                            {branch.address_line}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 4: Hotline & Customer Care (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-gray-800 pb-2">
              Order by Phone
            </h3>
            <div className="bg-gradient-to-br from-gray-900 to-gray-850 p-4 rounded-2xl border border-gray-800 space-y-3">
              <div className="text-xs text-gray-400 font-medium">UAN Order Hotline</div>
              <a
                href={`tel:${hotline.replace(/\s+/g, '')}`}
                className="block font-black text-lg text-[#FFC107] hover:underline"
              >
                {hotline}
              </a>
              <div className="text-[11px] text-gray-400">
                Email: <span className="text-white block font-medium">{email}</span>
              </div>
              <div className="pt-2 border-t border-gray-800 text-[10px] text-emerald-400 font-medium">
                ● 11:00 AM - 03:00 AM Daily
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Payment Methods, and Powered By */}
        <div className="pt-8 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>
            {copyright}
          </div>
          <div className="flex items-center gap-3 text-gray-400 font-semibold text-[11px]">
            <span>Cash on Delivery</span>
            <span>•</span>
            <span>Debit / Credit Card</span>
            <span>•</span>
            <span>JazzCash / EasyPaisa</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
