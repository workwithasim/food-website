'use client';

import React, { useState } from 'react';

interface ProductItem {
  id: string;
  name: string;
  cat: string;
  soldOut: boolean;
  price: string;
}

export default function BranchInventoryPage() {
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const [items, setItems] = useState<ProductItem[]>([
    { id: '1', name: 'Mighty Zinger', cat: 'Burgers', soldOut: false, price: 'Rs 850' },
    { id: '2', name: 'Loaded Fries', cat: 'Sides', soldOut: true, price: 'Rs 450' },
    { id: '3', name: 'Pepsi (Can)', cat: 'Drinks', soldOut: false, price: 'Rs 150' },
    { id: '4', name: 'Chicken Fajita Pizza (L)', cat: 'Pizza', soldOut: false, price: 'Rs 1,890' },
    { id: '5', name: 'Chocolate Lava Cake', cat: 'Desserts', soldOut: false, price: 'Rs 550' },
  ]);

  const toggleAvailability = (id: string, name: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const next = !item.soldOut;
        setNotification(next ? `Marked "${name}" as SOLD OUT at this branch.` : `Marked "${name}" as AVAILABLE for customer orders.`);
        setTimeout(() => setNotification(null), 3500);
        return { ...item, soldOut: next };
      }
      return item;
    }));
  };

  const filtered = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.cat.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-sm font-semibold border border-blue-500">
          ✓ {notification}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branch Inventory & 86-ing</h1>
          <p className="text-sm text-gray-500 mt-0.5">Toggle real-time item availability for this branch.</p>
        </div>
        <div className="flex space-x-3">
          <input 
            type="text" 
            placeholder="Search items or categories..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
          />
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Name</th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="relative px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                  No catalog items found matching &quot;{search}&quot;.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{p.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.cat}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                      p.soldOut 
                        ? 'bg-red-50 text-red-700 border border-red-200' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {p.soldOut ? 'Sold Out (86ed)' : 'Available Online'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => toggleAvailability(p.id, p.name)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
                        p.soldOut 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                          : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-300'
                      }`}
                    >
                      {p.soldOut ? '✓ Mark Available' : '✕ Mark Sold Out'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
