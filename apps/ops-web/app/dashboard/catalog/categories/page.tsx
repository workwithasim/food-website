'use client';

import React, { useState } from 'react';

interface CategoryItem {
  id: string;
  name: string;
  productCount: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([
    { id: '1', name: 'Burgers', productCount: 15 },
    { id: '2', name: 'Pizza', productCount: 12 },
    { id: '3', name: 'Sides & Appetizers', productCount: 9 },
    { id: '4', name: 'Beverages & Drinks', productCount: 6 },
    { id: '5', name: 'Desserts', productCount: 3 },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    if (editingCat) {
      setCategories(prev => prev.map(c => c.id === editingCat.id ? { ...c, name: categoryName } : c));
      showToast(`Category updated to "${categoryName}"`);
      setEditingCat(null);
    } else {
      const newCat: CategoryItem = {
        id: Date.now().toString(),
        name: categoryName,
        productCount: 0
      };
      setCategories(prev => [...prev, newCat]);
      showToast(`Added new category "${categoryName}"`);
    }

    setCategoryName('');
    setShowModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      setCategories(prev => prev.filter(c => c.id !== id));
      showToast(`Deleted category "${name}"`);
    }
  };

  const handleEdit = (cat: CategoryItem) => {
    setEditingCat(cat);
    setCategoryName(cat.name);
    setShowModal(true);
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
          <h1 className="text-2xl font-bold text-gray-900">Menu Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">Organize your food offerings into customer-facing catalog sections.</p>
        </div>
        <button 
          onClick={() => {
            setEditingCat(null);
            setCategoryName('');
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
        >
          + Add Category
        </button>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {categories.map((category) => (
            <li key={category.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
              <div className="flex items-center">
                <span className="text-gray-400 mr-4 cursor-grab text-lg">⋮⋮</span>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{category.name}</h3>
                  <p className="text-xs text-gray-500">{category.productCount} active products</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => handleEdit(category)}
                  className="text-blue-600 hover:text-blue-900 text-sm font-semibold cursor-pointer"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(category.id, category.name)}
                  className="text-red-600 hover:text-red-900 text-sm font-semibold cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-bold text-gray-900">
                {editingCat ? 'Edit Category' : 'New Category'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Category Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Seafood & Platters"
                  value={categoryName}
                  onChange={e => setCategoryName(e.target.value)}
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
