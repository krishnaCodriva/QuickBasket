/**
 * @file domain.ts
 * @description Core domain models for QuickBasket.
 * These are the single source of truth for all business entities.
 * Import from here — never redefine locally.
 */

// ─── Product ────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  price: number;
  mrp: number;
  weight: string;
  emoji: string;
  categoryId: string;
  subCategoryId?: string;
  category: string; // legacy string representation for UI
  inStock: boolean;
  tags?: string[];
  brand?: string;
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  quantity: number;
  inStock: boolean;
}

// ─── Address ─────────────────────────────────────────────────────────────────

export type AddressType = 'home' | 'work' | 'other';

export interface Address {
  id: string;
  label: string;
  type: AddressType;
  fullName: string;
  mobile: string;
  flat: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  /** Formatted single-line address string */
  address: string;
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export interface PaymentMethod {
  id: string;
  label: string;
  details: string;
}

export interface PaymentDetails {
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  upiId: string;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'Order Placed'
  | 'Order Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  taxes: number;
  totalPayable: number;
  address: Address;
  paymentMethod: string;
  paymentMethodId?: string;
  estimatedDelivery: string;
  status: OrderStatus;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  avatar?: string;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export type CategoryColorName =
  | 'red100'
  | 'green100'
  | 'blue100'
  | 'orange100'
  | 'pink100'
  | 'yellow100'
  | 'indigo100'
  | 'cyan100';

export interface Category {
  id: string;
  /** i18n key for the category name */
  nameKey: string;
  emoji: string;
  colorName: CategoryColorName;
}

export interface SubCategory {
  id: string;
  categoryId: string; // foreign key to Category.id
  nameKey: string;
  imageUrl: string;
}

// ─── Banner ───────────────────────────────────────────────────────────────────

export type BannerLinkType = 'category' | 'offer' | 'product';

export interface Banner {
  id: string;
  source: number; // require() image source
  linkType: BannerLinkType;
  linkTarget: string;
}

// ─── Language ─────────────────────────────────────────────────────────────────

export type LanguageCode = 'en' | 'hi';

export interface SupportedLanguage {
  code: LanguageCode;
  /** Display label in that language */
  label: string;
  /** Single character icon/abbreviation */
  icon: string;
}
