'use client';

import React, { useState } from 'react';

interface RiderSettlement {
  id: string;
  name: string;
  deliveries: number;
  cashHeld: number;
  status: 'Pending' | 'Settled';
}

export default function CODPage() {
  const [riders, setRiders] = useState<RiderSettlement[]>([
    { id: '1', name: 'Kamran Ali', deliveries: 3, cashHeld: 4200, status: 'Pending' },
    { id: '2', name: 'Ahmed Raza', deliveries: 2, cashHeld: 3100, status: 'Pending' },
    { id: '3', name: 'Zain Abbas', deliveries: 1, cashHeld: 1150, status: 'Pending' },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const totalOutstanding = riders
    .filter(r => r.status === 'Pending')
    .reduce((sum, r) => sum + r.cashHeld, 0);

  const handleReceiveCash = (riderId: string) => {
    const target = riders.find(r => r.id === riderId);
    if (!target || target.status === 'Settled') return;

    const amount = target.cashHeld;
    setRiders(prev => prev.map(r => r.id === riderId ? { ...r, cashHeld: 0, status: 'Settled' } : r));

    setNotification(`Successfully collected Rs ${amount.toLocaleString()} from ${target.name}. Settlement recorded!`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSettleAll = () => {
    if (totalOutstanding === 0) return;
    setRiders(prev => prev.map(r => ({ ...r, cashHeld: 0, status: 'Settled' })));
    setNotification(`All pending cash (Rs ${totalOutstanding.toLocaleString()}) has been settled!`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl text-sm font-semibold border border-emerald-500 flex items-center space-x-2">
          <span>✓</span>
          <span>{notification}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">COD Settlements</h1>
          <p className="text-sm text-gray-500 mt-1">Reconcile and collect cash on delivery from riders.</p>
        </div>
        {totalOutstanding > 0 && (
          <button 
            onClick={handleSettleAll}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            Collect All Cash (Rs {totalOutstanding.toLocaleString()})
          </button>
        )}
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Pending Cash Collection</h2>
            <p className="text-sm text-gray-500 mt-0.5">Cash held by riders awaiting branch handover.</p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-extrabold ${totalOutstanding > 0 ? 'text-gray-900' : 'text-emerald-600'}`}>
              Rs {totalOutstanding.toLocaleString()}
            </p>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
              {totalOutstanding > 0 ? 'Total Outstanding' : 'All Settled'}
            </p>
          </div>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rider</th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Deliveries Completed</th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cash Held</th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="relative px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {riders.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{r.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{r.deliveries} deliveries today</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  {r.status === 'Pending' ? (
                    <span className="text-red-600 font-bold">Rs {r.cashHeld.toLocaleString()}</span>
                  ) : (
                    <span className="text-gray-400 font-normal">Rs 0</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    r.status === 'Pending' 
                      ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {r.status === 'Pending' ? 'Pending Handover' : 'Settled & Verified'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {r.status === 'Pending' ? (
                    <button 
                      onClick={() => handleReceiveCash(r.id)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
                    >
                      Receive Cash
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-semibold">✓ Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
