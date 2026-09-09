'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface CartContextType {
  cart: any; // We'll type this dynamically
  isLoading: boolean;
  guestToken: string;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, variantId?: string, quantity?: number, modifiers?: string[]) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [guestToken, setGuestToken] = useState<string>('');

  useEffect(() => {
    let token = localStorage.getItem('guest_token');
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem('guest_token', token);
    }
    setGuestToken(token);
    fetchCart(token);
  }, []);

  const fetchCart = async (token: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3001/v1/cart', {
        headers: { 'X-Guest-Token': token }
      });
      if (res.ok) {
        setCart(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const refreshCart = async () => {
    if (guestToken) await fetchCart(guestToken);
  };

  const addToCart = async (productId: string, variantId?: string, quantity: number = 1, modifiers: string[] = []) => {
    try {
      const res = await fetch('http://localhost:3001/v1/cart/items', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Guest-Token': guestToken 
        },
        body: JSON.stringify({ product_id: productId, variant_id: variantId, quantity, modifiers })
      });
      if (res.ok) {
        setCart(await res.json());
        setSidebarOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const method = quantity > 0 ? 'PUT' : 'DELETE';
      const url = `http://localhost:3001/v1/cart/items/${itemId}`;
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'X-Guest-Token': guestToken 
        },
        body: quantity > 0 ? JSON.stringify({ quantity }) : undefined
      });
      if (res.ok) setCart(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <CartContext.Provider value={{ cart, isLoading, guestToken, refreshCart, addToCart, updateQuantity, isSidebarOpen, setSidebarOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
