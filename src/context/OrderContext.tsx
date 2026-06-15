/**
 * OrderContext.tsx
 * Refactored under the QuickBasket Enterprise Architecture Plan.
 *
 * Changes:
 * - Order.address type changed from `any` to the typed `Address` domain model
 * - OrderStatus, Order, CartItem imported from core/types (single source of truth)
 * - Fetches real orders from the backend API.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  ReactNode,
} from 'react';
import type { CartItem, Order, OrderStatus } from '../core/types/domain';
import { orderApi } from '../services/orderApi';
import { useAuth } from './AuthContext';

export type { Order, OrderStatus };

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'Order Placed',
  'Order Confirmed',
  'Processing',
  'Packed',
  'Out for Delivery',
  'Delivered',
];

interface OrderContextType {
  orders: Order[];
  addOrder: () => void; // Trigger a refresh instead of pushing manually
  getOrderById: (id: string) => Order | undefined;
  fetchOrders: () => Promise<void>;
  isLoading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isLoading: isAuthLoading, user } = useAuth();
  const isAuthenticated = !!user;

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const res = await orderApi.getOrders();
      
      console.log("RAW ORDERS API RESPONSE:", JSON.stringify(res, null, 2));

      // Account for either res.data.rows or res.rows based on typical Axios wrappers
      let rows = [];
      if (Array.isArray(res)) rows = res;
      else if (Array.isArray(res?.data)) rows = res.data;
      else if (Array.isArray(res?.data?.rows)) rows = res.data.rows;
      else if (Array.isArray(res?.rows)) rows = res.rows;
      else if (Array.isArray(res?.data?.data)) rows = res.data.data;
      else if (Array.isArray(res?.orders)) rows = res.orders;
      else if (Array.isArray(res?.data?.orders)) rows = res.data.orders;
      
      if (Array.isArray(rows)) {
        const mappedOrders = rows.map((o: any) => {
          // Normalize status
          let formattedStatus = o.status;
          if (o.status === 'placed' || o.status === 'PLACED') formattedStatus = 'Order Placed';
          if (o.status === 'processing' || o.status === 'PROCESSING') formattedStatus = 'Processing';
          if (o.status === 'delivered' || o.status === 'DELIVERED') formattedStatus = 'Delivered';

          return {
            id: o.id,
            date: o.created_at || o.createdAt || new Date().toISOString(),
            status: formattedStatus as OrderStatus,
            totalPayable: parseFloat(o.grandTotal || o.totalAmount || o.subtotal || '0'),
            paymentMethod: o.paymentMethod || o.paymentStatus || '',
            items: [], // Not returned in the list API
            address: {} as any
          };
        });
        
        // Sort by date descending
        mappedOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setOrders(mappedOrders);
      }
    } catch (e) {
      console.error('Failed to fetch orders', e);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      fetchOrders();
    } else if (!isAuthenticated) {
      // Clear orders if user logs out or becomes guest
      setOrders([]);
    }
  }, [isAuthLoading, isAuthenticated, fetchOrders]);

  const addOrder = useCallback(() => {
    // When a new order is added, just re-fetch the list from the server
    fetchOrders();
  }, [fetchOrders]);

  const getOrderById = useCallback(
    (id: string) => orders.find((o) => o.id === id),
    [orders],
  );

  const contextValue = useMemo(
    () => ({ orders, addOrder, getOrderById, fetchOrders, isLoading }),
    [orders, addOrder, getOrderById, fetchOrders, isLoading],
  );

  return (
    <OrderContext.Provider value={contextValue}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
