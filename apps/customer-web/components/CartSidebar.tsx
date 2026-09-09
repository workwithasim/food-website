'use client';

import React, { useEffect, useRef } from 'react';
import { useCart } from './CartProvider';
import { Button } from '@restaurant/ui';

export function CartSidebar() {
  const { cart, isLoading, isSidebarOpen, setSidebarOpen, updateQuantity } = useCart();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isSidebarOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isSidebarOpen && dialog.open) {
      dialog.close();
    }
  }, [isSidebarOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    
    const handleCancel = (e: Event) => {
      e.preventDefault();
      setSidebarOpen(false);
    };
    
    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [setSidebarOpen]);

  const calculateItemTotal = (item: any) => {
    let total = item.product.base_price_minor;
    item.modifiers?.forEach(() => {
      // Simplification: In reality we need to fetch the modifier price delta, 
      // but for this phase we'll just show the base price.
    });
    return (total * item.quantity / 100).toFixed(2);
  };

  const calculateCartTotal = () => {
    if (!cart?.items) return '0.00';
    let total = 0;
    cart.items.forEach((item: any) => {
      total += item.product.base_price_minor * item.quantity;
    });
    return (total / 100).toFixed(2);
  };

  return (
    <dialog 
      ref={dialogRef}
      className="m-0 h-full max-h-none w-full max-w-md ml-auto backdrop:bg-black/50 open:animate-in open:slide-in-from-right open:fade-in-90 p-0 shadow-xl"
    >
      <div className="flex h-full flex-col bg-white">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-bold">Your Cart</h2>
          <button onClick={() => setSidebarOpen(false)} aria-label="Close Cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <p className="text-gray-500 text-center mt-10">Loading cart...</p>
          ) : !cart?.items || cart.items.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">Your cart is empty.</p>
          ) : (
            <ul className="space-y-4">
              {cart.items.map((item: any) => (
                <li key={item.id} className="flex gap-4 border-b pb-4">
                  <div className="h-16 w-16 bg-gray-100 rounded-md overflow-hidden">
                    {item.product.media?.[0] && (
                      <img src={item.product.media[0].media_url} alt={item.product.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">{item.product.name}</span>
                      <span className="font-semibold">{item.product.currency_code} {calculateItemTotal(item)}</span>
                    </div>
                    {item.modifiers?.length > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        + {item.modifiers.length} modifiers
                      </p>
                    )}
                    <div className="flex items-center mt-2 gap-3">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 rounded-full border flex items-center justify-center hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 rounded-full border flex items-center justify-center hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart?.items?.length > 0 && (
          <div className="border-t p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-4 text-lg font-bold">
              <span>Total</span>
              <span>{cart.items[0].product.currency_code} {calculateCartTotal()}</span>
            </div>
            <Button variant="primary" className="w-full justify-center py-4 text-lg">
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
    </dialog>
  );
}
