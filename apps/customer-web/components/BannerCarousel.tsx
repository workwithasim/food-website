'use client';

import React, { useState, useEffect } from 'react';

interface Banner {
  id: string;
  title: string;
  image_url: string;
  target_url?: string;
}

const FALLBACK_BANNERS: Banner[] = [
  {
    id: '1',
    title: 'Somewhat Local — Taste the Authentic Pakistani Spices',
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1400&auto=format&fit=crop&q=80',
    target_url: '/#somewhat-local',
  },
  {
    id: '2',
    title: 'Crown Crust & Cheezy Stuffed — Melt in Every Bite',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1400&auto=format&fit=crop&q=80',
    target_url: '/#pizza-deals',
  },
  {
    id: '3',
    title: 'Bazinga Crunch Burgers — Crispy, Juicy & Extra Saucy',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1400&auto=format&fit=crop&q=80',
    target_url: '/#burgers',
  },
];

export function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>(FALLBACK_BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function loadBanners() {
      try {
        const res = await fetch('http://localhost:4000/api/v1/cms/public/banners', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setBanners(data);
          }
        }
      } catch (err) {
        console.error('Failed to load banners:', err);
      }
    }
    loadBanners();
  }, []);

  // Auto-play interval
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-lg group bg-gray-900 aspect-[21/9] sm:aspect-[24/9] md:aspect-[3/1] max-h-[420px]">
      {/* Slide Image */}
      {banners.map((b, idx) => (
        <div
          key={b.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <img
            src={b.image_url}
            alt={b.title}
            className="w-full h-full object-cover brightness-75 scale-105 transition-transform duration-7000"
          />
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-8 md:p-12">
            <div className="max-w-2xl text-white space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-[#FFC107] text-gray-950 font-black text-xs uppercase tracking-wider shadow-sm">
                Special Promotion
              </span>
              <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold tracking-tight drop-shadow-md line-clamp-2">
                {b.title}
              </h2>
              <div>
                <a
                  href={b.target_url || '#'}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F15B25] hover:bg-[#d94a18] text-white font-bold rounded-xl text-sm shadow-lg transition-all hover:scale-105"
                >
                  <span>Order Now</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center font-black shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous Slide"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center font-black shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next Slide"
          >
            ›
          </button>
        </>
      )}

      {/* Indicator Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 right-6 z-20 flex gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2.5 rounded-full transition-all ${
                idx === currentIndex ? 'w-8 bg-[#FFC107]' : 'w-2.5 bg-white/60 hover:bg-white'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
