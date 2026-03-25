"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface CartItem {
  productId: string;
  sizeId: string;
  sizeLabel: string;
  quantity: number;
  price: number;
  productName: string;
  productImage: string;
  brandName: string;
  productSlug: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, sizeId: string) => void;
  updateQuantity: (productId: string, sizeId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "najo_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // Invalid data
    }
    setLoaded(true);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, loaded]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === item.productId && i.sizeId === item.sizeId
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId && i.sizeId === item.sizeId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((productId: string, sizeId: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.sizeId === sizeId))
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, sizeId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, sizeId);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId && i.sizeId === sizeId
            ? { ...i, quantity }
            : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
