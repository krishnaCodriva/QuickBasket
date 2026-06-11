/**
 * OrderContext.tsx
 * Refactored under the QuickBasket Enterprise Architecture Plan.
 *
 * Changes:
 * - Order.address type changed from `any` to the typed `Address` domain model
 * - OrderStatus, Order, CartItem imported from core/types (single source of truth)
 * - ORDER_STATUS_FLOW moved here until a future phase migrates it to core/constants
 * - Re-exports types so existing imports still work
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

// Re-export for backward compatibility with existing imports
export type { Order, OrderStatus };

// ─── Order status flow ────────────────────────────────────────────────────────

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'Order Placed',
  'Order Confirmed',
  'Processing',
  'Packed',
  'Out for Delivery',
  'Delivered',
];

/** Interval (ms) for mock order progression in development */
const ORDER_PROGRESS_INTERVAL_MS = 15000;

// ─── Context type ─────────────────────────────────────────────────────────────

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'status'>) => void;
  getOrderById: (id: string) => Order | undefined;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  // Mock real-time order progress simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (
            order.status === 'Delivered' ||
            order.status === 'Cancelled'
          ) {
            return order;
          }
          const currentIndex = ORDER_STATUS_FLOW.indexOf(order.status);
          if (currentIndex < ORDER_STATUS_FLOW.length - 1) {
            return {
              ...order,
              status: ORDER_STATUS_FLOW[currentIndex + 1] as OrderStatus,
            };
          }
          return order;
        }),
      );
    }, ORDER_PROGRESS_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const addOrder = useCallback((order: Omit<Order, 'status'>) => {
    setOrders((prev) => [
      { ...order, status: 'Order Placed' as OrderStatus },
      ...prev,
    ]);
  }, []);

  const getOrderById = useCallback(
    (id: string) => orders.find((o) => o.id === id),
    [orders],
  );

  const contextValue = useMemo(
    () => ({ orders, addOrder, getOrderById }),
    [orders, addOrder, getOrderById],
  );

  return (
    <OrderContext.Provider value={contextValue}>
      {children}
    </OrderContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
