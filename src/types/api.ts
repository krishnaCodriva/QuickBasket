// Common Types
export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Domain Models (aligned with frontend currently)
export interface Banner {
  id: string;
  imageUrl: string;
  title?: string;
  targetScreen?: string;
}

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  unit: string;
  imageUrl: string;
  inStock: boolean;
  description?: string;
}

// Home Feed Response
export interface HomeFeedData {
  banners: Banner[];
  categories: Category[];
  products: Product[];
  pagination: Pagination;
}

export type HomeFeedResponse = ApiResponse<HomeFeedData>;
