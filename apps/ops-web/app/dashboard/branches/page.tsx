'use client';

import React, { useState } from 'react';

interface BranchItem {
  id: string;
  name: string;
  status: 'Open' | 'Closed' | 'Paused';
  orders: number;
  staff: number;
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<BranchItem[]>([
    { id: '1', name: 'Central Branch', status: 'Open', orders: 12, staff: 4 },
    { id: '2', name: 'DHA Phase 5', status: 'Closed', orders: 0, staff: 2 },
    { id: '3', name: 'Gulberg Branch', status: 'Open', orders: 7, staff: 3 },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const togglePause = (id: string, name: string) => {
    setBranches(prev => prev.map(b => {
      if (b.id === id) {
        const next = b.status === 'Paused' ? 'Open' : 'Paused';
        showToast(`Branch "${name}" is now ${next.toUpperCase()}`);
        return { ...b, status: next };
      }
      return b;
    }));
  };

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;

    const newBranch: BranchItem = {
      id: Date.now().toString(),
      name: newBranchName,
      status: 'Open',
      orders: 0,
      staff: 1
    };
    setBranches(prev => [...prev, newBranch]);
    showToast(`Added new branch "${newBranchName}"`);
    setNewBranchName('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-sm font-semibold border border-blue-500">
          ✓ {notification}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branch Locations</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage operational branches, operating hours, and dispatch zones.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
        >
          + Add Branch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <div key={branch.id} className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition">
            <div>
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-900">{branch.name}</h3>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                  branch.status === 'Open' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : branch.status === 'Paused'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}>
                  {branch.status === 'Open' ? '● Open' : branch.status === 'Paused' ? '⚠️ Paused' : '○ Closed'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-3 bg-gray-50 rounded-lg p-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Live Orders</p>
                  <p className="mt-1 text-2xl font-extrabold text-gray-900">{branch.orders}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Staff On Duty</p>
                  <p className="mt-1 text-2xl font-extrabold text-gray-900">{branch.staff}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <button 
                onClick={() => togglePause(branch.id, branch.name)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                  branch.status === 'Paused' 
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' 
                    : 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                }`}
              >
                {branch.status === 'Paused' ? '▶ Resume' : '⚠️ Emergency Pause'}
              </button>
              <button 
                onClick={() => showToast(`Opened configuration for ${branch.name}`)}
                className="text-blue-600 hover:text-blue-900 text-xs font-bold"
              >
                Configure Settings →
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-bold text-gray-900">Add New Branch</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleAddBranch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Branch Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. F-7 Markaz, Islamabad"
                  value={newBranchName}
                  onChange={e => setNewBranchName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Create Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
