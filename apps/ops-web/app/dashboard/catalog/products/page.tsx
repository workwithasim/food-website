'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface ProductItem {
  id: string;
  name: string;
  slug?: string;
  cat: string;
  categoryId?: string;
  price: number;
  status: 'Active' | 'Inactive';
  description?: string;
  imageUrl?: string;
}

const DEFAULT_IMAGE_BY_CATEGORY: Record<string, string> = {
  Burgers: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
  Pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
  Sides: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80',
  Drinks: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=600&auto=format&fit=crop&q=80',
  Desserts: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add / Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    status: 'Active' as 'Active' | 'Inactive',
    description: '',
    imageUrl: '',
  });

  // Delete Confirmation Modal state
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast notifications
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Fetch categories
      const catRes = await fetch('/api/categories');
      let catList: CategoryItem[] = [];
      if (catRes.ok) {
        catList = await catRes.json();
        setCategories(catList);
      }

      // 2. Fetch products
      const prodRes = await fetch('/api/products');
      if (prodRes.ok) {
        const rawProducts = await prodRes.json();
        const mapped: ProductItem[] = rawProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          cat: p.category?.name || 'Burgers',
          categoryId: p.category_id || p.category?.id || '',
          price: typeof p.base_price_minor === 'number' ? Math.round(p.base_price_minor / 100) : 0,
          status: p.status === 'ACTIVE' ? 'Active' : 'Inactive',
          description: p.description || '',
          imageUrl: p.media?.[0]?.media_url || '',
        }));
        setProducts(mapped);
      } else {
        console.error('Failed to load products:', await prodRes.text());
      }
    } catch (err: any) {
      console.error('Error fetching catalog data:', err);
      showToast('Could not sync with backend API', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    const defaultCatId = categories[0]?.id || '';
    setFormData({
      name: '',
      categoryId: defaultCatId,
      price: '',
      status: 'Active',
      description: '',
      imageUrl: '',
    });
    setShowModal(true);
  };

  const handleEdit = (p: ProductItem) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      categoryId: p.categoryId || (categories.find(c => c.name === p.cat)?.id || categories[0]?.id || ''),
      price: p.price.toString(),
      status: p.status,
      description: p.description || '',
      imageUrl: p.imageUrl || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter a product name', 'error');
      return;
    }

    const priceNum = parseFloat(formData.price) || 0;
    if (priceNum <= 0) {
      showToast('Please enter a valid price', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Pick category
      const targetCatId = formData.categoryId || categories[0]?.id;
      const targetCat = categories.find(c => c.id === targetCatId);
      const fallbackImg = DEFAULT_IMAGE_BY_CATEGORY[targetCat?.name || 'Burgers'] || DEFAULT_IMAGE_BY_CATEGORY.Burgers;
      const finalImageUrl = formData.imageUrl.trim() || fallbackImg;

      if (editingProduct) {
        // PUT update
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            category_id: targetCatId,
            price: priceNum,
            status: formData.status,
            description: formData.description.trim(),
            image_url: finalImageUrl,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to update product');
        }

        showToast(`Updated "${formData.name}" successfully`);
      } else {
        // POST create
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            category_id: targetCatId,
            price: priceNum,
            status: formData.status,
            description: formData.description.trim(),
            image_url: finalImageUrl,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to create product');
        }

        showToast(`Created "${formData.name}" - now live on store!`);
      }

      setShowModal(false);
      setEditingProduct(null);
      await loadData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error saving product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (p: ProductItem) => {
    const nextStatus = p.status === 'Active' ? 'Inactive' : 'Active';

    // Optimistic update
    setProducts(prev => prev.map(item => item.id === p.id ? { ...item, status: nextStatus } : item));

    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error('Status update failed');
      showToast(`Changed "${p.name}" status to ${nextStatus}`);
    } catch (err) {
      console.error(err);
      // Revert on error
      setProducts(prev => prev.map(item => item.id === p.id ? { ...item, status: p.status } : item));
      showToast('Could not update product status', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/products/${deletingProduct.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete product');

      showToast(`Product "${deletingProduct.name}" deleted successfully`);
      setDeletingProduct(null);
      await loadData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to delete product', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.cat.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-2xl text-sm font-semibold border flex items-center space-x-2 transition-all ${
          notification.type === 'error'
            ? 'bg-rose-900 text-white border-rose-500'
            : 'bg-gray-900 text-white border-emerald-500'
        }`}>
          <span>{notification.type === 'error' ? '✕' : '✓'}</span>
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">Menu Products</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 mr-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Live Sync Active
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage food items, prices, categories, and online availability for customer store.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadData()}
            title="Refresh from database"
            className="p-2 border border-gray-300 hover:bg-gray-100 rounded-lg text-gray-600 transition"
          >
            ↻
          </button>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56 md:w-64"
          />
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition flex items-center space-x-1"
          >
            <span>+</span>
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Name</th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Base Price</th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="relative px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                  <div className="inline-block animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2"></div>
                  <div>Loading live menu products...</div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                  No products found matching &quot;{search}&quot;.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-lg">🍔</span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">{p.name}</div>
                        {p.description && (
                          <div className="text-xs text-gray-400 truncate max-w-xs">{p.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{p.cat}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">Rs {p.price.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(p)}
                      title="Click to toggle status"
                      className={`px-2.5 py-1 inline-flex text-xs leading-4 font-semibold rounded-full cursor-pointer transition ${
                        p.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {p.status === 'Active' ? '● Active' : '○ Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-blue-600 hover:text-blue-900 font-semibold cursor-pointer transition"
                      >
                        Edit
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => setDeletingProduct(p)}
                        className="text-rose-600 hover:text-rose-900 font-semibold cursor-pointer transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-xs text-gray-500">
                  {editingProduct ? 'Update product details and sync with customer store.' : 'New product will immediately appear on customer website.'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 font-bold p-1">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crispy Gourmet Strips"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {categories.length > 0 ? (
                      categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="">Burgers</option>
                        <option value="">Pizza</option>
                        <option value="">Sides</option>
                        <option value="">Drinks</option>
                        <option value="">Desserts</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Base Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="850"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Active">Active (Visible & Orderable on Store)</option>
                  <option value="Inactive">Inactive (Hidden from Customers)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Ingredients, taste profile, or serving size..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-[11px] text-gray-400 mt-1">Leave empty to use a high-resolution category stock photo.</p>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-xl">
                ⚠️
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Product</h3>
                <p className="text-xs text-gray-500">Confirm catalog deletion</p>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Are you sure you want to delete <span className="font-bold text-gray-900">&quot;{deletingProduct.name}&quot;</span>?
              This will permanently remove the item from your catalog and it will immediately disappear from the Customer Store.
            </p>

            <div className="flex justify-end space-x-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
