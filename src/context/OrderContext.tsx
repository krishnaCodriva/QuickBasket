import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CartItem } from './CartContext';

export type OrderStatus = 'Order Placed' | 'Order Confirmed' | 'Processing' | 'Packed' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'Order Placed',
  'Order Confirmed',
  'Processing',
  'Packed',
  'Out for Delivery',
  'Delivered'
];

export type Order = {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  taxes: number;
  totalPayable: number;
  address: any;
  paymentMethod: string;
  estimatedDelivery: string;
  status: OrderStatus;
};

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'status'>) => void;
  getOrderById: (id: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  // Mock real-time progress: Every 15 seconds, advance orders that aren't Delivered or Cancelled
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders => prevOrders.map(order => {
        if (order.status === 'Delivered' || order.status === 'Cancelled') {
          return order;
        }
        const currentIndex = ORDER_STATUS_FLOW.indexOf(order.status);
        if (currentIndex < ORDER_STATUS_FLOW.length - 1) {
          return { ...order, status: ORDER_STATUS_FLOW[currentIndex + 1] };
        }
        return order;
      }));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const addOrder = (order: Omit<Order, 'status'>) => {
    setOrders(prev => [{ ...order, status: 'Order Placed' }, ...prev]);
  };

  const getOrderById = (id: string) => {
    return orders.find(o => o.id === id);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, getOrderById }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
