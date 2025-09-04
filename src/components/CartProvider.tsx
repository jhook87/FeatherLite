"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

// Define a cart item. We store the SKU, quantity and an optional name
// field which is useful for displaying the item later. Additional fields
// such as price can be added in the future if desired.
export type CartItem = {
  sku: string;
  qty: number;
  name?: string;
};

// Context type. Exposes the list of items currently in the cart along
// with helper functions to add a new item or clear the cart entirely.
type CartCtx = {
  items: CartItem[];
  add: (sku: string, name?: string, qty?: number) => void;
  clear: () => void;
};

// Create the React context. We initialise with null as we'll provide
// the value within the provider component below.
const CartContext = createContext<CartCtx | null>(null);

/**
 * CartProvider wraps the application and provides cart functionality
 * via React context. Components can use the useCart hook to access the
 * cart state. Cart state is local to the client and does not persist
 * across sessions. Consider adding persistence via localStorage in a
 * future iteration.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Add an item to the cart. If the item already exists the quantity
  // increases. Otherwise a new item is appended.
  const add = (sku: string, name?: string, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.sku === sku);
      if (existing) {
        return prev.map((i) =>
          i.sku === sku ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { sku, qty, name }];
    });
  };

  // Clear the cart completely.
  const clear = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, add, clear }}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * Hook to access the cart context. Throws an error if used outside
 * of the CartProvider. Components that call this hook must be within
 * a CartProvider in the React tree.
 */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}