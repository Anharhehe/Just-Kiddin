"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "../data/demo";

const STORAGE_KEY = "just-kidin-cart-v1";

export type CartItem = {
  cartItemId: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size: string;
  color: string;
  category: string;
  ageGroup: Product["ageGroup"];
  gender: Product["gender"];
  inStock: boolean;
};

type AddCartItemInput = {
  product: Product;
  quantity: number;
  size: string;
  color: string;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  hydrated: boolean;
  addItem: (input: AddCartItemInput) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function normalizeImage(image: Product["image"]): string {
  return Array.isArray(image) ? image[0] : image;
}

function createCartItemId(productId: string, size: string, color: string) {
  return `${productId}__${size}__${color}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      /* ignore malformed cache */
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const addItem = ({ product, quantity, size, color }: AddCartItemInput) => {
      const normalizedQuantity = Math.max(1, quantity);
      const cartItemId = createCartItemId(product.id, size, color);
      const image = normalizeImage(product.image);

      setItems((prev) => {
        const existing = prev.find((item) => item.cartItemId === cartItemId);

        if (existing) {
          return prev.map((item) =>
            item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + normalizedQuantity } : item
          );
        }

        return [
          ...prev,
          {
            cartItemId,
            productId: product.id,
            name: product.name,
            price: product.price,
            image,
            quantity: normalizedQuantity,
            size,
            color,
            category: product.category,
            ageGroup: product.ageGroup,
            gender: product.gender,
            inStock: product.inStock,
          },
        ];
      });
    };

    const updateQuantity = (cartItemId: string, quantity: number) => {
      setItems((prev) =>
        prev
          .map((item) => (item.cartItemId === cartItemId ? { ...item, quantity } : item))
          .filter((item) => item.quantity > 0)
      );
    };

    const removeItem = (cartItemId: string) => {
      setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    };

    const clearCart = () => setItems([]);

    return {
      items,
      itemCount,
      subtotal,
      hydrated,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    };
  }, [hydrated, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}