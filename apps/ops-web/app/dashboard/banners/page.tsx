'use client';

import React, { useState, useEffect } from 'react';

interface BannerItem {
  id: string;
  title: string;
  image_url: string;
  target_url?: string;
  is_active: boolean;
  sort_order: number;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    target_url: '/#somewhat-local',
    sort_order: 1,
    is_active: true,
  });

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/banners');
      if (res.ok) {
        const data = await res.json();
        setBanners(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      image_url: '',
      target_url: '/#pizza-deals',
      sort_order: banners.length + 1,
      is_active: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (b: BannerItem) => {
    setEditingBanner(b);
    setFormData({
      title: b.title,
      image_url: b.image_url,
      target_url: b.target_url || '',
      sort_order: b.sort_order,
      is_active: b.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.image_url.trim()) return;

    try {
      if (editingBanner) {
        // Update
        const res = await fetch(`/api/banners/${editingBanner.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          showToast(`Updated banner "${formData.title}"`);
          fetchBanners();
          setShowModal(false);
        } else {
          alert('Failed to update banner');
        }
      } else {
        // Create
        const res = await fetch('/api/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          showToast(`Created new banner "${formData.title}"`);
          fetchBanners();
          setShowModal(false);
        } else {
          alert('Failed to create banner');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Error saving banner');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete banner "${title}"?`)) return;
    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Banner "${title}" deleted`);
        fetchBanners();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleActive = async (b: BannerItem) => {
    try {
      const res = await fetch(`/api/banners/${b.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !b.is_active }),
      });
      if (res.ok) {
        showToast(`Banner status updated`);
        fetchBanners();
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
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Hero Slider Banners (CMS)</h1>
          <p className="text-xs text-gray-500 mt-1">Manage hero promotional slider graphics and links shown at the top of the customer website.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#F15B25] hover:bg-[#d94a18] text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
        >
          <span>+ Add Banner</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-gray-400 text-sm">Loading banners from database...</div>
        ) : banners.length === 0 ? (
          <div className="p-16 text-center text-gray-500 text-sm">No promotional banners added yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-6">Preview</th>
                  <th className="py-3.5 px-6">Title & Target Link</th>
                  <th className="py-3.5 px-6">Order</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {banners.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-4 px-6">
                      <div className="h-16 w-28 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                        <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-900 font-bold text-sm max-w-sm">
                      <div>{b.title}</div>
                      <div className="text-xs text-blue-600 font-mono font-normal truncate mt-0.5">
                        {b.target_url || <span className="text-gray-400 italic">No link</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-gray-700 text-xs">
                      #{b.sort_order}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => toggleActive(b)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                          b.is_active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {b.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(b.id, b.title)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition cursor-pointer"
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

      {/* Add / Edit Banner Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-gray-900 text-lg">
                {editingBanner ? 'Edit Promo Banner' : 'Add Promo Banner'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Banner Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Midnight Craving Deals — 20% Off"
                  required
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#F15B25] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Banner Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  required
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#F15B25] focus:outline-none"
                />
                {formData.image_url && (
                  <div className="mt-2 h-20 w-full rounded-lg overflow-hidden bg-gray-100 border">
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Target Link</label>
                  <input
                    type="text"
                    value={formData.target_url}
                    onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                    placeholder="/#pizza-deals"
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#F15B25] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#F15B25] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded text-[#F15B25] focus:ring-[#F15B25]"
                  />
                  Active in Hero Slider
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
                  className="px-5 py-2 bg-[#F15B25] hover:bg-[#d94a18] text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
                >
                  {editingBanner ? 'Save Changes' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
