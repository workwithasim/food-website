'use client';

import React, { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    name: 'Cheezious',
    phone: '051 111 446 699',
    email: 'support@cheezious.com',
    logoUrl: 'https://cheezious.com/cheezious.svg',
    tagline: 'World of Flavors & Cheezy Treats',
    primaryColor: '#F15B25',
    secondaryColor: '#FFC107',
    footerText: 'Cheezious is one of the fastest-growing food chains in Pakistan, delivering oven-fresh pizzas, crunchy bazinga burgers, and cheesy delights across twin cities and beyond.',
    copyright: '© 2026 Cheezious Pakistan. All Rights Reserved.',
    googleMapsApiKey: '',
    currency: 'PKR',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        const settings = data.settings || {};
        const theme = (settings.theme_json as any) || {};

        setFormData({
          name: settings.restaurant_display_name || data.tenant?.name || 'Cheezious',
          phone: settings.support_phone || theme.hotline || '051 111 446 699',
          email: settings.support_email || 'support@cheezious.com',
          logoUrl: theme.logo_url || 'https://cheezious.com/cheezious.svg',
          tagline: theme.tagline || 'World of Flavors & Cheezy Treats',
          primaryColor: (theme.primary_color && theme.primary_color !== '#000000') ? theme.primary_color : '#F15B25',
          secondaryColor: (theme.secondary_color && theme.secondary_color !== '#000000') ? theme.secondary_color : '#FFC107',
          footerText: theme.footer_text || 'Cheezious is one of the fastest-growing food chains in Pakistan, delivering oven-fresh pizzas, crunchy bazinga burgers, and cheesy delights across twin cities and beyond.',
          copyright: theme.copyright || '© 2026 Cheezious Pakistan. All Rights Reserved.',
          googleMapsApiKey: theme.google_maps_api_key || '',
          currency: data.tenant?.default_currency || 'PKR',
        });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        restaurant_display_name: formData.name,
        name: formData.name,
        support_phone: formData.phone,
        hotline: formData.phone,
        support_email: formData.email,
        logo_url: formData.logoUrl,
        tagline: formData.tagline,
        primary_color: formData.primaryColor,
        secondary_color: formData.secondaryColor,
        footer_text: formData.footerText,
        copyright: formData.copyright,
        google_maps_api_key: formData.googleMapsApiKey.trim(),
      };

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setNotification('Store settings & branding saved to database and live on customer storefront!');
        setTimeout(() => setNotification(null), 4000);
      } else {
        alert('Failed to save settings');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-gray-500 font-bold">
        Loading restaurant settings from database...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3.5 rounded-xl shadow-2xl text-sm font-semibold border border-emerald-400 flex items-center space-x-2 animate-in fade-in slide-in-from-top-4">
          <span>✓</span>
          <span>{notification}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Store Brand & Settings</h1>
          <p className="text-xs text-gray-500 mt-1">Manage restaurant identity, customer contact details, theme colors, and footer info.</p>
        </div>
        <a 
          href="http://localhost:3002" 
          target="_blank" 
          rel="noreferrer"
          className="px-4 py-2 bg-orange-50 text-[#F15B25] border border-orange-200 rounded-xl text-xs font-black hover:bg-orange-100 transition flex items-center gap-1.5"
        >
          <span>View Live Store</span>
          <span>↗</span>
        </a>
      </div>

      <form onSubmit={handleSave} className="bg-white shadow-xs border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-8 divide-y divide-gray-100">
        {/* General Brand Identity */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-black text-gray-900">Brand Identity</h2>
            <p className="text-xs text-gray-400">Controls the name and logo shown across all headers and mobile apps.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Restaurant Brand Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#F15B25] focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Brand Tagline</label>
              <input 
                type="text" 
                value={formData.tagline}
                onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#F15B25] focus:outline-none" 
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Logo URL (SVG / PNG)</label>
              <div className="flex gap-3 items-center">
                <input 
                  type="url" 
                  value={formData.logoUrl}
                  onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                  className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#F15B25] focus:outline-none" 
                />
                {formData.logoUrl && (
                  <div className="h-10 w-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden p-1">
                    <img src={formData.logoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Contact & Hotline */}
        <div className="pt-6 space-y-4">
          <div>
            <h2 className="text-base font-black text-gray-900">Customer Support & Hotline</h2>
            <p className="text-xs text-gray-400">Displayed in the header, navigation drawer, order confirmation, and footer.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Hotline / Ordering Phone Number</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 051 111 446 699"
                required
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#F15B25] focus:outline-none font-semibold text-gray-900" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Support Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#F15B25] focus:outline-none" 
              />
            </div>
          </div>
        </div>

        {/* Theme Colors */}
        <div className="pt-6 space-y-4">
          <div>
            <h2 className="text-base font-black text-gray-900">Theme Styling & Colors</h2>
            <p className="text-xs text-gray-400">Controls dynamic UI buttons, accents, and banner badges.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Primary Color</label>
              <div className="flex gap-2 items-center">
                <input 
                  type="color" 
                  value={formData.primaryColor}
                  onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="h-10 w-12 border rounded-lg cursor-pointer p-0.5" 
                />
                <input 
                  type="text" 
                  value={formData.primaryColor}
                  onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="flex-1 px-3.5 py-2 border border-gray-300 rounded-xl text-sm uppercase font-mono" 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Secondary / Accent Color</label>
              <div className="flex gap-2 items-center">
                <input 
                  type="color" 
                  value={formData.secondaryColor}
                  onChange={e => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="h-10 w-12 border rounded-lg cursor-pointer p-0.5" 
                />
                <input 
                  type="text" 
                  value={formData.secondaryColor}
                  onChange={e => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="flex-1 px-3.5 py-2 border border-gray-300 rounded-xl text-sm uppercase font-mono" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Details */}
        <div className="pt-6 space-y-4">
          <div>
            <h2 className="text-base font-black text-gray-900">Footer Information</h2>
            <p className="text-xs text-gray-400">Displayed at the bottom of every customer storefront page.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Footer About Description</label>
              <textarea 
                rows={2}
                value={formData.footerText}
                onChange={e => setFormData({ ...formData, footerText: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#F15B25] focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Copyright Notice</label>
              <input 
                type="text" 
                value={formData.copyright}
                onChange={e => setFormData({ ...formData, copyright: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#F15B25] focus:outline-none" 
              />
            </div>
          </div>
        </div>

        {/* Google Maps & Geocoding Integration */}
        <div className="pt-6 space-y-4">
          <div>
            <h2 className="text-base font-black text-gray-900">Google Maps & Live Location Integration</h2>
            <p className="text-xs text-gray-400">Enter your Google Maps API key to power official Google Places address autocomplete and high-precision Google Geocoding.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Google Maps API Key (Optional)</label>
            <input 
              type="text" 
              value={formData.googleMapsApiKey}
              onChange={e => setFormData({ ...formData, googleMapsApiKey: e.target.value })}
              placeholder="e.g. AIzaSy..."
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-[#F15B25] focus:outline-none" 
            />
            <p className="text-[11px] text-gray-400 mt-1">
              When provided, customer storefront uses official Google Maps Geocoding & Places search. If left empty, the storefront uses high-accuracy satellite GPS and OpenStreetMap reverse geocoding for Pakistan.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 flex justify-end">
          <button 
            type="submit" 
            disabled={isSaving}
            className="px-6 py-3 bg-[#F15B25] hover:bg-[#d94a18] text-white text-sm font-extrabold rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? 'Saving Changes...' : 'Save & Publish Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
