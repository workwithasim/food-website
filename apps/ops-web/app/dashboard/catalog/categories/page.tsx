'use client';

import React, { useState, useEffect } from 'react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'INACTIVE';
  display_order?: number;
  products?: any[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCat(null);
    setCategoryName('');
    setCategorySlug('');
    setDisplayOrder(categories.length + 1);
    setShowModal(true);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCat(cat);
    setCategoryName(cat.name);
    setCategorySlug(cat.slug);
    setDisplayOrder(cat.display_order || 1);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      if (editingCat) {
        // Update
        const res = await fetch(`/api/categories/${editingCat.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: categoryName,
            slug: categorySlug || categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            display_order: displayOrder,
          }),
        });

        if (res.ok) {
          showToast(`Category updated to "${categoryName}"`);
          fetchCategories();
          setShowModal(false);
        } else {
          alert('Failed to update category');
        }
      } else {
        // Create
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: categoryName,
            slug: categorySlug || categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            display_order: displayOrder,
            status: 'ACTIVE',
          }),
        });

        if (res.ok) {
          showToast(`Added new category "${categoryName}"`);
          fetchCategories();
          setShowModal(false);
        } else {
          alert('Failed to create category');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Error saving category');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Deleted category "${name}"`);
        fetchCategories();
      } else {
        alert('Failed to delete category');
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
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Menu Categories</h1>
          <p className="text-xs text-gray-500 mt-1">Manage food categories, display orders, and menu sections in real time.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#F15B25] hover:bg-[#d94a18] text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
        >
          <span>+ Add Category</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-gray-400 text-sm">Loading categories from database...</div>
        ) : categories.length === 0 ? (
          <div className="p-16 text-center text-gray-500 text-sm">No categories found in database.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-6">Order</th>
                  <th className="py-3.5 px-6">Category Name</th>
                  <th className="py-3.5 px-6">Anchor Slug</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((cat, idx) => (
                  <tr key={cat.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-4 px-6 font-mono font-bold text-gray-400 text-xs">
                      #{cat.display_order ?? idx + 1}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-gray-900">
                      {cat.name}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-orange-600 bg-orange-50/40 rounded-md">
                      #{cat.slug}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        {cat.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-gray-900 text-lg">
                {editingCat ? 'Edit Category' : 'Add New Category'}
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
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Category Name</label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => {
                    setCategoryName(e.target.value);
                    if (!editingCat) {
                      setCategorySlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  placeholder="e.g. Special Platters"
                  required
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#F15B25] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Slug (Anchor Link)</label>
                <input
                  type="text"
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  placeholder="special-platters"
                  required
                  className="w-full px-3 py-2 border rounded-xl text-sm font-mono focus:ring-2 focus:ring-[#F15B25] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Display Order</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#F15B25] focus:outline-none"
                />
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
                  {editingCat ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
