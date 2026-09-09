'use client';

import React, { useState } from 'react';

export function LocationSelector() {
  const [method, setMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');

  return (
    <div className="flex items-center rounded-full border bg-white p-1 shadow-sm text-sm">
      <button 
        onClick={() => setMethod('DELIVERY')}
        className={`px-3 py-1.5 rounded-full font-medium transition-colors ${method === 'DELIVERY' ? 'bg-rose-100 text-rose-700' : 'text-gray-600 hover:text-gray-900'}`}
      >
        Delivery
      </button>
      <button 
        onClick={() => setMethod('PICKUP')}
        className={`px-3 py-1.5 rounded-full font-medium transition-colors ${method === 'PICKUP' ? 'bg-rose-100 text-rose-700' : 'text-gray-600 hover:text-gray-900'}`}
      >
        Pickup
      </button>
    </div>
  );
}
