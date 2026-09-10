'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from './CartProvider';

export function CartSidebar() {
  const { cart, isLoading, isSidebarOpen, setSidebarOpen, updateQuantity } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  if (!isSidebarOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'CHEEZY20') {
      setAppliedDiscount(20);
      setCouponMessage('Promo code CHEEZY20 applied! 20% Discount');
    } else if (couponCode.trim()) {
      setCouponMessage('Invalid or expired promo code');
      setAppliedDiscount(0);
    }
  };

  const calculateSubtotalMinor = () => {
    if (!cart?.items) return 0;
    let total = 0;
    cart.items.forEach((item: any) => {
      let itemPriceMinor = item.variant?.price_minor ?? item.product?.base_price_minor ?? 0;
      let modDeltaMinor = 0;
      item.modifiers?.forEach((m: any) => {
        const delta = m.modifier?.price_delta_minor ?? m.price_delta_minor ?? 0;
        modDeltaMinor += Number(delta);
      });
      total += (Number(itemPriceMinor) + modDeltaMinor) * (item.quantity || 1);
    });
    return total;
  };

  const subtotal = calculateSubtotalMinor() / 100;
  const discountAmount = (subtotal * appliedDiscount) / 100;
  const deliveryFee = subtotal > 2000 || subtotal === 0 ? 0 : 150;
  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setSidebarOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <h2 className="text-lg font-black text-gray-900">Your Cheezious Order</h2>
            {cart?.items?.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#F15B25] text-white text-xs font-bold">
                {cart.items.reduce((acc: number, i: any) => acc + (i.quantity || 1), 0)} items
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="h-8 w-8 rounded-full bg-white border border-gray-200 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-600 transition"
            aria-label="Close Cart"
          >
            ✕
          </button>
        </div>

        {/* Fulfillment Banner */}
        <div className="bg-orange-50 px-5 py-2.5 border-b border-orange-100 flex items-center justify-between text-xs">
          <span className="font-bold text-[#F15B25] flex items-center gap-1.5">
            <span>🛵</span>
            <span>Estimated Delivery Time</span>
          </span>
          <span className="font-black text-gray-800">30 - 45 Mins</span>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading ? (
            <div className="text-center py-16 text-gray-400 text-sm">Loading your cart...</div>
          ) : !cart?.items || cart.items.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="text-5xl">🍕</div>
              <h3 className="text-lg font-bold text-gray-800">Your cart is empty</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Explore our delicious pizzas, bazinga burgers, and cheesy treats to start ordering!
              </p>
              <button
                onClick={() => setSidebarOpen(false)}
                className="px-6 py-2.5 bg-[#F15B25] hover:bg-[#d94a18] text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.items.map((item: any) => {
                const itemBaseMinor = item.variant?.price_minor ?? item.product?.base_price_minor ?? 0;
                const modsDeltaMinor = item.modifiers?.reduce((acc: number, m: any) => {
                  const delta = m.modifier?.price_delta_minor ?? m.price_delta_minor ?? 0;
                  return acc + Number(delta);
                }, 0) || 0;
                const itemTotal = ((Number(itemBaseMinor) + modsDeltaMinor) * (item.quantity || 1)) / 100;
                const imageUrl = item.product?.media?.[0]?.media_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=80';
                const productName = item.product?.name || 'Delicious Item';

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-gray-200/80 bg-white hover:border-orange-200 transition space-y-2 shadow-2xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                        <img src={imageUrl} alt={productName} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-extrabold text-gray-900 text-sm leading-tight truncate">
                            {productName}
                          </h4>
                          <span className="font-black text-gray-900 text-sm whitespace-nowrap">
                            PKR {itemTotal.toLocaleString()}
                          </span>
                        </div>

                        {/* Variants & Modifiers Chips */}
                        {item.variant && (
                          <div className="text-[11px] font-semibold text-[#F15B25] mt-0.5">
                            {item.variant.name}
                          </div>
                        )}

                        {item.modifiers && item.modifiers.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.modifiers.map((m: any) => {
                              const modName = m.modifier?.name || m.name || 'Extra';
                              const modPrice = m.modifier?.price_delta_minor ?? m.price_delta_minor ?? 0;
                              return (
                                <span
                                  key={m.id}
                                  className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-medium"
                                >
                                  + {modName} {modPrice > 0 ? `(+${modPrice / 100})` : ''}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quantity modifier and Delete */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                      <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center font-bold text-gray-700 hover:bg-gray-200 transition"
                        >
                          -
                        </button>
                        <span className="w-7 text-center font-black text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center font-bold text-gray-700 hover:bg-gray-200 transition"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => updateQuantity(item.id, 0)}
                        className="text-gray-400 hover:text-rose-600 text-xs font-semibold transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Order Summary & Checkout */}
        {cart?.items?.length > 0 && (
          <div className="p-5 border-t border-gray-200 bg-white space-y-4 shadow-lg">
            {/* Promo Code Input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Promo Code (e.g. CHEEZY20)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-xs uppercase font-bold focus:outline-none focus:ring-2 focus:ring-[#F15B25]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition"
              >
                Apply
              </button>
            </form>
            {couponMessage && (
              <p className={`text-[11px] font-bold ${appliedDiscount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {couponMessage}
              </p>
            )}

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Subtotal</span>
                <span>PKR {subtotal.toLocaleString()}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount ({appliedDiscount}%)</span>
                  <span>- PKR {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `PKR ${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-100">
                <span>Total Amount</span>
                <span className="text-[#F15B25]">PKR {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <Link
              href="/checkout"
              onClick={() => setSidebarOpen(false)}
              className="w-full py-3.5 bg-[#F15B25] hover:bg-[#d94a18] text-white font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-between px-6 text-sm"
            >
              <span>Proceed to Checkout</span>
              <span>PKR {grandTotal.toLocaleString()} →</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
