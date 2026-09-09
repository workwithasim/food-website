'use client';

import React, { useState } from 'react';

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    name: 'Antigravity Burger',
    email: 'support@antigravityburger.com',
    primaryColor: '#e11d48',
    currency: 'PKR',
    taxPercent: '16',
    deliveryRadiusKm: '8'
  });

  const [notification, setNotification] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification('Restaurant configuration saved and synced across all branches!');
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-xl text-sm font-semibold border border-emerald-500 flex items-center space-x-2">
          <span>✓</span>
          <span>{notification}</span>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tenant Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Configure platform branding, tax policies, and global restaurant options.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white shadow-sm border border-gray-200 rounded-xl p-8 space-y-8">
        <div>
          <h2 className="text-lg font-bold text-gray-900">General Information</h2>
          <p className="text-xs text-gray-500 mb-4">Core identity and customer contact information.</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Restaurant Brand Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Support Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Branding & Theme</h2>
          <p className="text-xs text-gray-500 mb-4">Customize brand colors and logos shown on the customer storefront.</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Primary Brand Color</label>
              <div className="flex items-center space-x-3">
                <input 
                  type="color" 
                  value={formData.primaryColor}
                  onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5" 
                />
                <input 
                  type="text" 
                  value={formData.primaryColor}
                  onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase font-mono" 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Brand Logo</label>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-xs text-gray-600">
                  LOGO
                </div>
                <button 
                  type="button"
                  onClick={() => alert('Logo upload dialog simulated. S3 bucket configured.')}
                  className="px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Upload New Logo
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Financial & Delivery Defaults</h2>
          <p className="text-xs text-gray-500 mb-4">Default tax rates and standard delivery radius for new branches.</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Sales Tax (%)</label>
              <input 
                type="number" 
                value={formData.taxPercent}
                onChange={e => setFormData({ ...formData, taxPercent: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Max Delivery Radius (km)</label>
              <input 
                type="number" 
                value={formData.deliveryRadiusKm}
                onChange={e => setFormData({ ...formData, deliveryRadiusKm: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button 
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-md transition cursor-pointer"
          >
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
}
