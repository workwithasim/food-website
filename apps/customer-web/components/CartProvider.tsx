'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface CartContextType {
  cart: any;
  isLoading: boolean;
  guestToken: string;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, variantId?: string, quantity?: number, modifiers?: string[]) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<any>({ id: 'cart-local', items: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [guestToken, setGuestToken] = useState<string>('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

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
      const res = await fetch(`${apiUrl}/v1/cart`, {
        headers: { 'X-Guest-Token': token }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.items) {
          setCart(data);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCart = async () => {
    if (guestToken) await fetchCart(guestToken);
  };

  const addToCart = async (productId: string, variantId?: string, quantity: number = 1, modifiers: string[] = []) => {
    try {
      const res = await fetch(`${apiUrl}/v1/cart/items`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Guest-Token': guestToken 
        },
        body: JSON.stringify({ product_id: productId, variant_id: variantId, quantity, modifiers })
      });
      if (res.ok) {
        setCart(await res.json());
      } else {
        // Fallback local addition if API requires product payload
        fetchFallbackItem(productId, variantId, quantity, modifiers);
      }
    } catch (e) {
      console.error(e);
      fetchFallbackItem(productId, variantId, quantity, modifiers);
    }
  };

  const fetchFallbackItem = async (productId: string, variantId?: string, quantity: number = 1, modifiers: string[] = []) => {
    try {
      const pRes = await fetch(`${apiUrl}/v1/catalog/products`);
      if (pRes.ok) {
        const allProducts = await pRes.json();
        const product = allProducts.find((p: any) => p.id === productId);
        if (product) {
          const newItem = {
            id: `item-${Date.now()}`,
            product,
            variant: product.variants?.find((v: any) => v.id === variantId),
            modifiers: product.modifier_groups?.flatMap((mg: any) => mg.modifier_group?.modifiers || []).filter((m: any) => modifiers.includes(m.id)) || [],
            quantity,
          };
          setCart((prev: any) => ({
            id: prev?.id || 'cart-local',
            items: [...(prev?.items || []), newItem],
          }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const method = quantity > 0 ? 'PUT' : 'DELETE';
      const url = `${apiUrl}/v1/cart/items/${itemId}`;
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'X-Guest-Token': guestToken 
        },
        body: quantity > 0 ? JSON.stringify({ quantity }) : undefined
      });
      if (res.ok) {
        setCart(await res.json());
        return;
      }
    } catch (e) {
      console.error(e);
    }

    // Local state update fallback
    setCart((prev: any) => {
      if (!prev?.items) return prev;
      if (quantity <= 0) {
        return { ...prev, items: prev.items.filter((i: any) => i.id !== itemId) };
      }
      return {
        ...prev,
        items: prev.items.map((i: any) => i.id === itemId ? { ...i, quantity } : i),
      };
    });
  };

  const clearCart = () => {
    setCart({ id: 'cart-local', items: [] });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        guestToken,
        refreshCart,
        addToCart,
        updateQuantity,
        clearCart,
        isSidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
