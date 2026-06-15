/**
 * CartContext.tsx
 * Refactored under the QuickBasket Enterprise Architecture Plan.
 *
 * Changes:
 * - Uses real backend endpoints from cartApi to fetch/update cart.
 * - Extracts subtotal, tax, deliveryCharge, grandTotal directly from the API.
 * - Maps nested or flat backend cart item formats to our UI CartItem type.
 */

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { Alert } from 'react-native';
import type { Product, CartItem } from '../core/types/domain';
import { cartApi } from '../services/cartApi';
import { useAuth } from './AuthContext';

// Re-export CartItem so existing imports from CartContext still work
export type { CartItem };

// ─── Context type ─────────────────────────────────────────────────────────────

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (id: string, delta: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  subtotal: number;
  tax: number;
  deliveryCharge: number;
  grandTotal: number;
  hasOutOfStock: boolean;
  isLoading: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();

  // Map backend cart structure to frontend state
  const mapBackendCart = useCallback((cartData: any) => {
    if (!cartData) {
      setCartItems([]);
      setSubtotal(0);
      setTax(0);
      setDeliveryCharge(0);
      setGrandTotal(0);
      return;
    }
    
    // Safely handle different item arrays
    const items = cartData.items || [];
    
    // Sort items consistently to prevent UI jumping when updating quantities
    items.sort((a: any, b: any) => {
      if (a.created_at && b.created_at) {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      const idA = a.product?._id || a.productId || a.id || '';
      const idB = b.product?._id || b.productId || b.id || '';
      return String(idA).localeCompare(String(idB));
    });

    const mappedItems: CartItem[] = items.map((item: any) => {
      // The product details might be nested under 'Product', 'product', or be flat
      const productObj = item.Product || item.product || item;
      return {
        id: productObj._id || productObj.id || item.productId || item.id,
        name: productObj.name || 'Unknown Item',
        price: productObj.price || item.price || 0,
        emoji: productObj.emoji || '📦',
        quantity: item.quantity || 1,
        inStock: productObj.inStock !== false,
      };
    });

    setCartItems(mappedItems);
    setSubtotal(parseFloat(cartData.calculations?.subtotal || cartData.subtotal || '0'));
    setTax(parseFloat(cartData.calculations?.tax || cartData.tax || '0'));
    setDeliveryCharge(parseFloat(cartData.calculations?.deliveryCharge || cartData.deliveryCharge || '0'));
    setGrandTotal(parseFloat(cartData.calculations?.grandTotal || cartData.grandTotal || '0'));
  }, []);

  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await cartApi.getCart();
      if (res.success && res.data) {
        mapBackendCart(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch cart', e);
    } finally {
      setIsLoading(false);
    }
  }, [mapBackendCart]);

  const previousUser = React.useRef(user);
  const cartItemsRef = React.useRef(cartItems);

  React.useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  // Initial fetch and on auth change
  useEffect(() => {
    const justLoggedOut = previousUser.current && !user;
    previousUser.current = user;

    if (justLoggedOut && cartItemsRef.current.length > 0) {
      // Automatically migrate the current cart into the new guest session
      const migrateCartToGuest = async () => {
        setIsLoading(true);
        try {
          // Add all previous items to the new guest session
          for (const item of cartItemsRef.current) {
            await cartApi.addToCart(item.id, item.quantity);
          }
        } catch (e) {
          console.error('Failed to migrate cart to guest session', e);
        } finally {
          fetchCart(); // Fetch the final migrated state
        }
      };
      // Wait for AuthContext to finish creating the guest session, then migrate
      setTimeout(migrateCartToGuest, 500); 
    } else {
      fetchCart();
    }
  }, [fetchCart, user]);
  const { isLoading: isAuthLoading } = useAuth();

  // Initial fetch
  useEffect(() => {
    if (!isAuthLoading) {
      fetchCart();
    }
  }, [fetchCart, isAuthLoading]);

  const addToCart = useCallback(async (product: Product, quantity: number = 1) => {
    setIsLoading(true);
    try {
      const res = await cartApi.addToCart(product.id, quantity);
      if (res.success && res.data) {
        mapBackendCart(res.data);
      } else {
        await fetchCart();
      }
    } finally {
      setIsLoading(false);
    }
  }, [mapBackendCart, fetchCart]);

  const updateQuantity = useCallback(async (id: string, delta: number) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    setIsLoading(true);
    
    try {
      if (newQuantity <= 0) {
        const res = await cartApi.removeFromCart(id);
        if (res.success && res.data) mapBackendCart(res.data);
        else await fetchCart();
      } else {
        // The backend /cart/add endpoint adds the quantity passed. 
        // So we just pass the 'delta' (e.g. +1 or -1) instead of the total newQuantity.
        const res = await cartApi.addToCart(id, delta);
        if (res.success && res.data) mapBackendCart(res.data);
        else await fetchCart();
      }
    } catch (e) {
      console.error('Error updating quantity:', e);
      await fetchCart();
    } finally {
      setIsLoading(false);
    }
  }, [cartItems, mapBackendCart, fetchCart]);

  const removeFromCart = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const res = await cartApi.removeFromCart(id);
      if (res.success && res.data) {
        mapBackendCart(res.data);
      } else {
        await fetchCart();
      }
    } finally {
      setIsLoading(false);
    }
  }, [mapBackendCart, fetchCart]);

  const clearCart = useCallback(async () => {
    console.warn("Backend CLEAR endpoint not provided yet. Cannot clear fully via API.");
    // Temporarily clear locally since no endpoint is provided
    mapBackendCart(null);
  }, [mapBackendCart]);

  // ─── Derived values ──────────────────────────────────────────────────────────
  
  const totalItems = useMemo(
    () => cartItems.length,
    [cartItems]
  );

  const hasOutOfStock = useMemo(
    () => cartItems.some((item) => !item.inStock),
    [cartItems]
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
      tax,
      deliveryCharge,
      grandTotal,
      hasOutOfStock,
      isLoading
    }),
    [
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalItems,
      subtotal,
      tax,
      deliveryCharge,
      grandTotal,
      hasOutOfStock,
      isLoading
    ]
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
