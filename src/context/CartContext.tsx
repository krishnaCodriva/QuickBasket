import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  emoji: string;
  quantity: number;
  inStock: boolean;
};

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  hasOutOfStock: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (product: any, quantity: number = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      // Ensure we extract only needed fields to keep state lean, but we need inStock and emoji
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        emoji: product.emoji || '📦',
        inStock: product.inStock !== false && product.inStock !== 'false',
        quantity,
      }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        if (!item.inStock) return item; // Can't update out-of-stock items
        return { ...item, quantity: item.quantity + delta };
      }
      return item;
    }).filter(item => item.quantity > 0)); // Remove if quantity goes to 0 or below
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCartItems([]);

  const totalItems = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);
  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cartItems]);
  const hasOutOfStock = useMemo(() => cartItems.some(item => !item.inStock), [cartItems]);

  const contextValue = useMemo(() => ({
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    subtotal,
    hasOutOfStock,
  }), [cartItems, totalItems, subtotal, hasOutOfStock]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
