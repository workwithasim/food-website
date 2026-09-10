'use client';

import React, { useState, useMemo } from 'react';
import { BannerCarousel } from './BannerCarousel';
import { CategoryNav } from './CategoryNav';
import { ProductCard } from './ProductCard';
import { ProductModal } from './ProductModal';
import { useCart } from './CartProvider';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  base_price_minor: number;
  currency_code: string;
  media?: { media_url: string }[];
  category?: { id: string; name: string; slug: string };
  variants?: any[];
  modifier_groups?: any[];
}

interface MenuExplorerProps {
  initialCategories: Category[];
  initialProducts: Product[];
}

const CATEGORY_EMOJIS: Record<string, string> = {
  'Somewhat Local': '🌶️',
  'Pizza Deals': '🔥',
  'Cheezy Treats': '✨',
  'Thin Crust Pizza': '🍕',
  'Burgers': '🍔',
  'Sides': '🍟',
  'Desserts': '🍰',
  'Beverages': '🥤',
  'Drinks': '🥤',
  'Pizza': '🍕',
};

export function MenuExplorer({ initialCategories, initialProducts }: MenuExplorerProps) {
  const { cart, setSidebarOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCategories[0]?.slug || 'somewhat-local');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const cartItemCount = cart?.items?.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) || 0;
  const cartSubtotalMinor = cart?.items?.reduce((acc: number, item: any) => {
    const base = item.variant?.price_minor ?? item.product?.base_price_minor ?? 0;
    const mods = (item.modifiers || []).reduce((mAcc: number, m: any) => {
      const delta = m.modifier?.price_delta_minor ?? m.price_delta_minor ?? 0;
      return mAcc + Number(delta);
    }, 0);
    return acc + ((Number(base) + mods) * (item.quantity || 1));
  }, 0) || 0;

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return initialProducts;
    const q = searchQuery.toLowerCase();
    return initialProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.name.toLowerCase().includes(q)
    );
  }, [initialProducts, searchQuery]);

  // Group products by category
  const productsByCategory = useMemo(() => {
    const map = new Map<string, Product[]>();

    initialCategories.forEach((cat) => {
      map.set(cat.slug, []);
    });

    filteredProducts.forEach((p) => {
      const slug = p.category?.slug || 'other';
      if (!map.has(slug)) {
        map.set(slug, []);
      }
      map.get(slug)!.push(p);
    });

    return map;
  }, [initialCategories, filteredProducts]);

  const handleSelectCategory = (slug: string) => {
    setActiveCategory(slug);
    const element = document.getElementById(slug);
    if (element) {
      const yOffset = -90; // offset for sticky nav
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Hero Promotional Banners Carousel */}
      <section className="pt-2">
        <BannerCarousel />
      </section>

      {/* 2. Sticky Horizontal Category Navigation */}
      <CategoryNav
        categories={initialCategories}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* Mobile Search Input */}
      <div className="md:hidden px-2 pt-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search Cheezious menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-full text-sm bg-white shadow-xs focus:ring-2 focus:ring-[#F15B25] focus:outline-none"
          />
          <span className="absolute left-3.5 top-3 text-gray-400 text-xs">🔍</span>
        </div>
      </div>

      {/* 3. Menu Category Sections */}
      <div className="space-y-12 pt-4">
        {initialCategories.map((cat) => {
          const items = productsByCategory.get(cat.slug) || [];
          if (items.length === 0 && searchQuery) return null;

          const emoji = CATEGORY_EMOJIS[cat.name] || '🍽️';

          return (
            <section key={cat.id} id={cat.slug} className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                      {cat.name}
                    </h2>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-400">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {items.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 text-sm">
                  No items currently available in this category.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {items.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={(p) => setSelectedProduct(p)}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* 4. Product Customizer & Add-ons Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
      />

      {/* 5. Mobile Floating Cart Button */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-5 left-4 right-4 z-40 md:hidden animate-in slide-in-from-bottom duration-300">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-full py-3.5 px-6 bg-[#F15B25] text-white font-extrabold rounded-2xl shadow-2xl flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-white text-[#F15B25] text-xs font-black flex items-center justify-center">
                {cartItemCount}
              </span>
              <span>View Cart</span>
            </div>
            <span>PKR {(cartSubtotalMinor / 100).toLocaleString()} →</span>
          </button>
        </div>
      )}
    </div>
  );
}
