"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { NormalizedCart, NormalizedCartItem } from '@/lib/shopify';

export type CartItem = NormalizedCartItem;

type CartSnapshot = {
  cartId: string | null;
  checkoutUrl: string | null;
  currencyCode: string;
  subtotalCents: number;
  items: CartItem[];
};

type CartCtx = {
  cartId: string | null;
  checkoutUrl: string | null;
  currencyCode: string;
  subtotalCents: number;
  items: CartItem[];
  add: (options: { merchandiseId: string; quantity?: number }) => Promise<void>;
  remove: (lineId: string) => Promise<void>;
  updateQty: (lineId: string, quantity: number) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartCtx | null>(null);

const CART_STORAGE_KEY = 'featherlite:cart';

function readStoredCart(): CartSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartSnapshot) : null;
  } catch (error) {
    console.error('Unable to parse stored cart snapshot', error);
    return null;
  }
}

function writeStoredCart(snapshot: CartSnapshot | null) {
  if (typeof window === 'undefined') return;
  if (!snapshot || snapshot.items.length === 0) {
    window.localStorage.removeItem(CART_STORAGE_KEY);
    window.localStorage.removeItem('shopify-cart-id');
    return;
  }
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(snapshot));
  if (snapshot.cartId) {
    window.localStorage.setItem('shopify-cart-id', snapshot.cartId);
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [initialSnapshot] = useState<CartSnapshot | null>(() => readStoredCart());
  const [cartId, setCartId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return initialSnapshot?.cartId ?? window.localStorage.getItem('shopify-cart-id');
  });
  const [items, setItems] = useState<CartItem[]>(() => initialSnapshot?.items ?? []);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(() => initialSnapshot?.checkoutUrl ?? null);
  const [subtotalCents, setSubtotalCents] = useState(() => initialSnapshot?.subtotalCents ?? 0);
  const [currencyCode, setCurrencyCode] = useState(() => initialSnapshot?.currencyCode ?? 'USD');

  const applyCart = useCallback((cart: NormalizedCart | null | undefined) => {
    if (cart && cart.id) {
      setCartId(cart.id);
      setItems(Array.isArray(cart.items) ? cart.items : []);
      setCheckoutUrl(cart.checkoutUrl ?? null);
      setSubtotalCents(cart.subtotalCents ?? 0);
      setCurrencyCode(cart.currencyCode ?? 'USD');
      writeStoredCart({
        cartId: cart.id,
        checkoutUrl: cart.checkoutUrl ?? null,
        currencyCode: cart.currencyCode ?? 'USD',
        subtotalCents: cart.subtotalCents ?? 0,
        items: Array.isArray(cart.items) ? cart.items : [],
      });
    } else {
      setItems([]);
      setCheckoutUrl(null);
      setSubtotalCents(0);
      setCurrencyCode('USD');
      setCartId(null);
      writeStoredCart({ cartId: null, checkoutUrl: null, currencyCode: 'USD', subtotalCents: 0, items: [] });
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (cartId) {
      localStorage.setItem('shopify-cart-id', cartId);
    } else {
      localStorage.removeItem('shopify-cart-id');
    }
  }, [cartId]);

  const refresh = useCallback(async () => {
    if (!cartId) return;
    try {
      const res = await fetch(`/api/shopify/cart?cartId=${encodeURIComponent(cartId)}`, {
        cache: 'no-store',
      });
      if (res.status === 404) {
        applyCart(null);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        console.error('Failed to refresh cart', data);
        return;
      }
      applyCart(data.cart);
    } catch (err) {
      console.error('Failed to refresh cart', err);
      const stored = readStoredCart();
      if (stored) {
        setItems(stored.items);
        setCheckoutUrl(stored.checkoutUrl);
        setSubtotalCents(stored.subtotalCents);
        setCurrencyCode(stored.currencyCode);
      }
    }
  }, [cartId, applyCart]);

  useEffect(() => {
    if (cartId) {
      refresh();
    } else {
      applyCart(null);
    }
  }, [cartId, refresh, applyCart]);

  const add = useCallback(
    async ({ merchandiseId, quantity = 1 }: { merchandiseId: string; quantity?: number }) => {
      if (!merchandiseId) {
        throw new Error('merchandiseId is required to add to cart.');
      }
      try {
        const res = await fetch('/api/shopify/cart', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            cartId,
            lines: [{ merchandiseId, quantity }],
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || 'Failed to add to cart');
        }
        applyCart(data.cart);
      } catch (err) {
        console.error('Failed to add item to cart', err);
        throw err;
      }
    },
    [cartId, applyCart]
  );

  const remove = useCallback(
    async (lineId: string) => {
      if (!cartId) return;
      try {
        const res = await fetch('/api/shopify/cart', {
          method: 'DELETE',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ cartId, lineIds: [lineId] }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || 'Failed to remove item');
        }
        applyCart(data.cart);
      } catch (err) {
        console.error('Failed to remove cart line', err);
        throw err;
      }
    },
    [cartId, applyCart]
  );

  const updateQty = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cartId) return;
      if (quantity <= 0) {
        await remove(lineId);
        return;
      }
      try {
        const res = await fetch('/api/shopify/cart', {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ cartId, lines: [{ id: lineId, quantity }] }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || 'Failed to update item');
        }
        applyCart(data.cart);
      } catch (err) {
        console.error('Failed to update cart line', err);
        throw err;
      }
    },
    [cartId, applyCart, remove]
  );

  const clear = useCallback(async () => {
    if (!cartId || items.length === 0) {
      applyCart(null);
      return;
    }
    try {
      const res = await fetch('/api/shopify/cart', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          cartId,
          lineIds: items.map((item) => item.id),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to clear cart');
      }
      applyCart(data.cart);
    } catch (err) {
      console.error('Failed to clear cart', err);
      throw err;
    }
  }, [cartId, items, applyCart]);

  const value = useMemo(
    () => ({
      cartId,
      checkoutUrl,
      currencyCode,
      subtotalCents,
      items,
      add,
      remove,
      updateQty,
      clear,
      refresh,
    }),
    [cartId, checkoutUrl, currencyCode, subtotalCents, items, add, remove, updateQty, clear, refresh]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}