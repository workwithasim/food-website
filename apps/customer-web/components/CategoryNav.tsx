'use client';

import React from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

const CATEGORY_ICONS: Record<string, string> = {
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

interface CategoryNavProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
}

export function CategoryNav({ categories, activeCategory, onSelectCategory }: CategoryNavProps) {
  return (
    <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.slug;
            const icon = CATEGORY_ICONS[cat.name] || '🍽️';

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.slug)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#F15B25] text-white shadow-md scale-102'
                    : 'bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-[#F15B25]'
                }`}
              >
                <span>{icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
