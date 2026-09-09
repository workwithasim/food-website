'use client';

import React, { useState } from 'react';

interface ProductItem {
  id: string;
  name: string;
  cat: string;
  price: number;
  status: 'Active' | 'Inactive';
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([
    { id: '1', name: 'Mighty Zinger', cat: 'Burgers', price: 850, status: 'Active' },
    { id: '2', name: 'Loaded Fries', cat: 'Sides', price: 450, status: 'Active' },
    { id: '3', name: 'Pepsi', cat: 'Drinks', price: 150, status: 'Active' },
    { id: '4', name: 'Chicken Fajita Pizza', cat: 'Pizza', price: 1890, status: 'Inactive' },
    { id: '5', name: 'Chocolate Lava Cake', cat: 'Desserts', price: 550, status: 'Active' },
  ]);

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [formData, setFormData] = useState({ name: '', cat: 'Burgers', price: '', status: 'Active' as 'Active' | 'Inactive' });
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(formData.price) || 0;

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
        ...p,
        name: formData.name,
        cat: formData.cat,
        price: priceNum,
        status: formData.status
      } : p));
      showToast(`Updated product "${formData.name}"`);
    } else {
      const newProduct: ProductItem = {
        id: Date.now().toString(),
        name: formData.name,
        cat: formData.cat,
        price: priceNum,
        status: formData.status
      };
      setProducts(prev => [...prev, newProduct]);
      showToast(`Created new product "${formData.name}"`);
    }

    setShowModal(false);
    setEditingProduct(null);
  };

  const toggleStatus = (id: string, name: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const next = p.status === 'Active' ? 'Inactive' : 'Active';
        showToast(`Changed "${name}" status to ${next}`);
        return { ...p, status: next };
      }
      return p;
    }));
  };

  const handleEdit = (p: ProductItem) => {
    setEditingProduct(p);
    setFormData({ name: p.name, cat: p.cat, price: p.price.toString(), status: p.status });
    setShowModal(true);
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.cat.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-sm font-semibold border border-blue-500">
          ✓ {notification}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage food items, prices, categories, and online availability.</p>
        </div>
        <div className="flex space-x-3">
          <input 
            type="text" 
            placeholder="Search products..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
          <button 
            onClick={() => {
              setEditingProduct(null);
              setFormData({ name: '', cat: 'Burgers', price: '', status: 'Active' });
              setShowModal(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            + Add Product
          </button>
        </div>
      </div>

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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                  No products found matching &quot;{search}&quot;.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg flex items-center justify-center font-bold text-sm">
                        🍔
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">{p.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{p.cat}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">Rs {p.price.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(p.id, p.name)}
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
                    <button 
                      onClick={() => handleEdit(p)}
                      className="text-blue-600 hover:text-blue-900 font-semibold cursor-pointer"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Product Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Crispy Chicken Tenders"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Category</label>
                <select 
                  value={formData.cat}
                  onChange={e => setFormData({ ...formData, cat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Burgers">Burgers</option>
                  <option value="Pizza">Pizza</option>
                  <option value="Sides">Sides</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Desserts">Desserts</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Base Price (PKR)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  placeholder="850"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Initial Status</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Active">Active (Available on Store)</option>
                  <option value="Inactive">Inactive (Hidden)</option>
                </select>
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
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
