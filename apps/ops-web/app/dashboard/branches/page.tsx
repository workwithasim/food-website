'use client';

import React, { useState, useEffect } from 'react';

interface BranchItem {
  id: string;
  name: string;
  code: string;
  city: string;
  address_line: string;
  phone?: string;
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED';
  accepts_delivery: boolean;
  accepts_pickup: boolean;
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    city: 'Islamabad',
    address: '',
    phone: '',
    status: 'ACTIVE' as 'ACTIVE' | 'PAUSED' | 'CLOSED',
    accepts_delivery: true,
    accepts_pickup: true,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<BranchItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/branches');
      if (res.ok) {
        const data = await res.json();
        setBranches(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setFormData({
      name: '',
      code: '',
      city: 'Islamabad',
      address: '',
      phone: '051 111 446 699',
      status: 'ACTIVE',
      accepts_delivery: true,
      accepts_pickup: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (b: BranchItem) => {
    setEditingBranch(b);
    setFormData({
      name: b.name,
      code: b.code,
      city: b.city,
      address: b.address_line,
      phone: b.phone || '',
      status: b.status,
      accepts_delivery: b.accepts_delivery,
      accepts_pickup: b.accepts_pickup,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingBranch) {
        // Update
        const res = await fetch(`/api/branches/${editingBranch.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            city: formData.city,
            address_line: formData.address,
            phone: formData.phone,
            status: formData.status,
            accepts_delivery: formData.accepts_delivery,
            accepts_pickup: formData.accepts_pickup,
          }),
        });

        if (res.ok) {
          showToast(`Updated branch "${formData.name}"`);
          fetchBranches();
          setShowModal(false);
        } else {
          alert('Failed to update branch');
        }
      } else {
        // Create
        const res = await fetch('/api/branches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            code: formData.code,
            city: formData.city,
            address_line: formData.address,
            phone: formData.phone,
            status: formData.status,
            accepts_delivery: formData.accepts_delivery,
            accepts_pickup: formData.accepts_pickup,
          }),
        });

        if (res.ok) {
          showToast(`Created new branch "${formData.name}"`);
          fetchBranches();
          setShowModal(false);
        } else {
          alert('Failed to create branch');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Error saving branch');
    }
  };

  const handleDelete = async () => {
    if (!branchToDelete) return;
    try {
      const res = await fetch(`/api/branches/${branchToDelete.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast(`Branch "${branchToDelete.name}" removed`);
        fetchBranches();
        setShowDeleteModal(false);
        setBranchToDelete(null);
      } else {
        alert('Failed to delete branch');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (b: BranchItem) => {
    const nextStatus = b.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/branches/${b.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        showToast(`Branch status changed to ${nextStatus}`);
        fetchBranches();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3.5 rounded-xl shadow-2xl text-sm font-semibold border border-emerald-400 animate-in fade-in">
          ✓ {notification}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Branch Management</h1>
          <p className="text-xs text-gray-500 mt-1">Manage physical locations, order phone numbers, and operational statuses.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#F15B25] hover:bg-[#d94a18] text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5"
        >
          <span>+ Add Branch</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-gray-400 text-sm">Loading branches from database...</div>
        ) : branches.length === 0 ? (
          <div className="p-16 text-center text-gray-500 text-sm">No branches registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-6">Branch Name & Code</th>
                  <th className="py-3.5 px-6">City & Address</th>
                  <th className="py-3.5 px-6">Phone Number</th>
                  <th className="py-3.5 px-6">Fulfillment</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {branches.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-4 px-6 font-extrabold text-gray-900">
                      <div>{b.name}</div>
                      <div className="text-[11px] font-mono text-gray-400 font-normal">{b.code}</div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 text-xs max-w-xs">
                      <div className="font-bold text-gray-800">{b.city}</div>
                      <div className="truncate text-gray-500">{b.address_line}</div>
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-800 text-xs">
                      {b.phone || <span className="text-gray-400 italic">No phone set</span>}
                    </td>
                    <td className="py-4 px-6 text-xs">
                      <div className="flex gap-1.5">
                        {b.accepts_delivery && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px]">
                            Delivery
                          </span>
                        )}
                        {b.accepts_pickup && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[10px]">
                            Pickup
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => toggleStatus(b)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                          b.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : b.status === 'PAUSED'
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        {b.status}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setBranchToDelete(b);
                          setShowDeleteModal(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Branch Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-gray-900 text-lg">
                {editingBranch ? 'Edit Branch' : 'Add New Branch'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Branch Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. F-10 Markaz Branch"
                    required
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#F15B25] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Branch Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. ISB-F10"
                    required
                    disabled={!!editingBranch}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#F15B25] focus:outline-none disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#F15B25] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="051 111 446 699"
                    required
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#F15B25] focus:outline-none font-semibold text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Street Address</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  placeholder="Full physical street address..."
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#F15B25] focus:outline-none"
                />
              </div>

              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.accepts_delivery}
                    onChange={(e) => setFormData({ ...formData, accepts_delivery: e.target.checked })}
                    className="rounded text-[#F15B25] focus:ring-[#F15B25]"
                  />
                  Accepts Delivery
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.accepts_pickup}
                    onChange={(e) => setFormData({ ...formData, accepts_pickup: e.target.checked })}
                    className="rounded text-[#F15B25] focus:ring-[#F15B25]"
                  />
                  Accepts Pickup
                </label>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#F15B25] hover:bg-[#d94a18] text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  {editingBranch ? 'Save Changes' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && branchToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4 animate-in zoom-in-95">
            <div className="text-4xl">⚠️</div>
            <h3 className="font-black text-gray-900 text-lg">Delete Branch?</h3>
            <p className="text-xs text-gray-500">
              Are you sure you want to delete <strong>{branchToDelete.name}</strong> ({branchToDelete.city})? Customers will no longer be able to place orders to this branch.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                Yes, Delete Branch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
