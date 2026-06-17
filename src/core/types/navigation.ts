/**
 * @file navigation.ts
 * @description Typed navigation parameter lists for all stacks and tabs.
 * Import and use these types in every screen — never use `navigation: any`.
 */

import type { Product, Order } from './domain';


// ─── Root Stack ───────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Splash: undefined;
  Location: undefined;
  ManualLocation: undefined;
  HomeTab: { screen?: keyof TabParamList } | undefined;
  ProductListing: { categoryId?: string; subCategoryId?: string; query?: string } | undefined;
  ProductDetail: { product: Product };
  Cart: undefined;
  Login: { returnTo?: string } | undefined;
  OtpScreen: { phoneNumber: string; returnTo?: string };
  DummyGoogleScreen: { returnTo?: string };
  Checkout: undefined;
  /** OrderSuccess receives the full Order object created at checkout */
  OrderSuccess: { order: Order };
  OrderStatus: { orderId: string };
  Invoice: { orderId: string };
  EditProfile: undefined;
  Orders: undefined;
};

// ─── Tab Stack ────────────────────────────────────────────────────────────────

export type TabParamList = {
  Home: undefined;
  CategoriesTab: { categoryId?: string } | undefined;
  OrdersTab: undefined;
  CartTab: undefined;
  ProfileTab: undefined;
};
