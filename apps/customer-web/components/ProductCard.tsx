import React from 'react';
import Link from 'next/link';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    base_price_minor: number;
    currency_code: string;
    media?: { media_url: string }[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const price = (product.base_price_minor / 100).toFixed(2);
  const imageUrl = product.media?.[0]?.media_url || 'https://placehold.co/400x300?text=No+Image';

  return (
    <Link href={`/product/${product.slug}`} className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md border border-gray-100">
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <img 
          src={imageUrl} 
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2 flex-1">
          {product.description || 'Deliciously crafted just for you.'}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            {product.currency_code} {price}
          </span>
          <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700 transition-colors group-hover:bg-rose-600 group-hover:text-white">
            Add
          </span>
        </div>
      </div>
    </Link>
  );
}
