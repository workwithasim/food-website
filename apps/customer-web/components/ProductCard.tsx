'use client';

import React, { useState } from 'react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    base_price_minor: number;
    currency_code: string;
    media?: { media_url: string }[];
    category?: { name: string };
    variants?: any[];
    modifier_groups?: any[];
  };
  onSelect?: (product: any) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const price = (product.base_price_minor / 100).toLocaleString();
  const imageUrl = product.media?.[0]?.media_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSelect) {
      onSelect(product);
    }
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <div
      onClick={handleClick}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-xs hover:shadow-xl transition-all duration-300 border border-gray-200/80 cursor-pointer hover:-translate-y-1"
    >
      {/* 4:3 Aspect Ratio Image with Favorite Heart */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Favorite Heart */}
        <button
          onClick={toggleFavorite}
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-sm shadow-md hover:scale-110 transition"
          aria-label="Save to favorites"
        >
          <span className={isFavorite ? 'text-rose-600' : 'text-gray-400'}>
            {isFavorite ? '❤️' : '🤍'}
          </span>
        </button>

        {product.category?.name && (
          <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold uppercase tracking-wider">
            {product.category.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-black text-gray-900 line-clamp-1 group-hover:text-[#F15B25] transition-colors">
          {product.name}
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-gray-500 line-clamp-2 flex-1 leading-relaxed">
          {product.description || 'Delicious freshly prepared recipe crafted with special house seasonings.'}
        </p>

        {/* Price and CTA */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 block uppercase">Price</span>
            <span className="text-base sm:text-lg font-black text-gray-900">
              {product.currency_code || 'PKR'} {price}
            </span>
          </div>

          <button
            onClick={handleClick}
            className="px-4 py-2 bg-[#FFC107] hover:bg-[#F15B25] text-gray-950 hover:text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <span>+</span>
            <span>ADD TO CART</span>
          </button>
        </div>
      </div>
    </div>
  );
}
