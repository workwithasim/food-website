import React from 'react';
import { notFound } from 'next/navigation';
import { ProductCustomizer } from '../../../components/ProductCustomizer';
import Link from 'next/link';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  let product = null;
  
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(`${apiUrl}/v1/catalog/products/${params.slug}`, { cache: 'no-store' });
    if (res.ok) {
      product = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch product:", err);
  }

  if (!product) {
    notFound();
  }

  const imageUrl = product.media?.length > 0 ? product.media[0].media_url : 'https://placehold.co/800x600?text=No+Image';

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border overflow-hidden mt-4">
      <div className="p-4 border-b">
        <Link href="/" className="text-rose-600 font-medium hover:underline inline-flex items-center gap-2">
          <span>&larr;</span> Back to Menu
        </Link>
      </div>
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2">
          <div className="aspect-[4/3] w-full bg-gray-100">
            <img 
              src={imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-600 leading-relaxed">
              {product.description || 'Deliciously crafted just for you.'}
            </p>
          </div>
        </div>
        
        <div className="w-full md:w-1/2 border-t md:border-t-0 md:border-l bg-gray-50/50">
          <ProductCustomizer product={product} />
        </div>
      </div>
    </div>
  );
}
