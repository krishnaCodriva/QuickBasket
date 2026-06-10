/**
 * CartContext.tsx
 * Refactored under the QuickBasket Enterprise Architecture Plan.
 *
 * Changes:
 * - addToCart now accepts Product (typed) instead of any
 * - CartItem imported from core/types (single source of truth)
 * - addToCart, updateQuantity, removeFromCart, clearCart wrapped with useCallback
 *   to prevent unnecessary re-renders in all consumer components
 * - contextValue uses useMemo correctly with stable function references
 */

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';
import type { Product, CartItem } from '../core/types/domain';

// Re-export CartItem so existing imports from CartContext still work
export type { CartItem };

// ─── Context type ─────────────────────────────────────────────────────────────

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  hasOutOfStock: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          emoji: product.emoji ?? '📦',
          inStock: product.inStock !== false,
          quantity,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          if (!item.inStock) return item; // Cannot update out-of-stock items
          return { ...item, quantity: item.quantity + delta };
        })
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // ─── Derived values ──────────────────────────────────────────────────────────
  const totalItems = useMemo(
    () => cartItems.length,
    [cartItems],
  );

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  const hasOutOfStock = useMemo(
    () => cartItems.some((item) => !item.inStock),
    [cartItems],
  );

  // ─── Context value — stable references via useCallback + useMemo ─────────────
  const contextValue = useMemo(
    () => ({
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalItems,
      subtotal,
      hasOutOfStock,
    }),
    [
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalItems,
      subtotal,
      hasOutOfStock,
    ],
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
