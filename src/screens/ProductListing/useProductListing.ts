/**
 * useProductListing.ts
 * Extracted from ProductListingScreen as part of the QuickBasket Enterprise Architecture Plan.
 *
 * Responsibilities:
 * - All state: products, pagination, loading, filters, sort, format toggle
 * - loadProducts, handleRefresh, handleLoadMore, handleUpdateCart
 * - Derived values: hasActiveFilters
 * - No JSX — pure logic hook
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { STRINGS } from '../../constants';
import { ProductService } from '../../services';
import { useCart } from '../../context';
import { MOCK_PRODUCTS } from '../../data/mockData';
import type { Product } from '../../core/types/domain';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductListingParams {
  categoryId?: string;
  subCategoryId?: string;
  query?: string;
}

export interface UseProductListingReturn {
  // Data
  products: typeof MOCK_PRODUCTS;
  // Loading states
  isLoading: boolean;
  isInitialLoad: boolean;
  isRefreshing: boolean;
  hasMore: boolean;
  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  // Sort
  activeSort: string;
  setActiveSort: (sort: string) => void;
  // Filters
  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
  outOfStockOnly: boolean;
  setOutOfStockOnly: (v: boolean) => void;
  filterPrice: string | null;
  setFilterPrice: (v: string | null) => void;
  filterCategoryId: string | null;
  setFilterCategoryId: (v: string | null) => void;
  filterSubCategoryId: string | null;
  setFilterSubCategoryId: (v: string | null) => void;
  filterTag: string | null;
  setFilterTag: (v: string | null) => void;
  // Layout
  isGridFormat: boolean;
  setIsGridFormat: (v: boolean) => void;
  // Actions
  handleRefresh: () => void;
  handleLoadMore: () => void;
  handleUpdateCart: (product: Product, delta: number) => void;
  // Derived
  hasActiveFilters: boolean;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProductListing(params: ProductListingParams): UseProductListingReturn {
  const { categoryId, subCategoryId, query = '' } = params;

  const { cartItems, addToCart, updateQuantity } = useCart();

  // ─── State ──────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQueryState] = useState(query);
  const [products, setProducts] = useState<typeof MOCK_PRODUCTS>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGridFormat, setIsGridFormat] = useState(true);
  const [activeSort, setActiveSortState] = useState(STRINGS.productListing.sortOptions.relevance);
  const [inStockOnly, setInStockOnlyState] = useState(false);
  const [outOfStockOnly, setOutOfStockOnlyState] = useState(false);
  const [filterPrice, setFilterPriceState] = useState<string | null>(null);
  const [filterCategoryId, setFilterCategoryIdState] = useState<string | null>(categoryId || null);
  const [filterSubCategoryId, setFilterSubCategoryIdState] = useState<string | null>(subCategoryId || null);
  const [filterTag, setFilterTagState] = useState<string | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Reload whenever any filter/search/sort changes
  useEffect(() => {
    loadProducts(1, true);
  }, [searchQuery, activeSort, inStockOnly, outOfStockOnly, filterPrice, filterCategoryId, filterSubCategoryId, filterTag]);

  // ─── Load products ───────────────────────────────────────────────────────────

  const loadProducts = (pageNumber: number, reset = false) => {
    if (isLoading && !reset) return;
    setIsLoading(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const result = ProductService.getProducts({
        page: pageNumber,
        limit: 10,
        categoryId: filterCategoryId || undefined,
        subCategoryId: filterSubCategoryId || undefined,
        searchQuery,
        inStockOnly,
        outOfStockOnly,
        sortOption: activeSort,
      });

      let filtered = result.products;

      // Client-side price range filter
      if (filterPrice) {
        if (filterPrice === STRINGS.productListing.priceRanges.under5) {
          filtered = filtered.filter((p) => p.price < 5);
        } else if (filterPrice === STRINGS.productListing.priceRanges.fiveToTen) {
          filtered = filtered.filter((p) => p.price >= 5 && p.price <= 10);
        } else if (filterPrice === STRINGS.productListing.priceRanges.over10) {
          filtered = filtered.filter((p) => p.price > 10);
        }
      }

      // Client-side tag filter
      if (filterTag) {
        filtered = filtered.filter((p) => p.tags?.includes(filterTag));
      }

      setProducts(reset ? filtered : (prev) => [...prev, ...filtered]);
      setPage(pageNumber);
      setHasMore(result.hasMore);
      setIsLoading(false);
      setIsRefreshing(false);
      setIsInitialLoad(false);
    }, 500);
  };

  // ─── Actions ─────────────────────────────────────────────────────────────────

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadProducts(1, true);
  }, [searchQuery, activeSort, inStockOnly, outOfStockOnly, filterPrice, filterCategoryId, filterSubCategoryId, filterTag]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && products.length > 0) {
      loadProducts(page + 1);
    }
  }, [hasMore, products.length, page]);

  const handleUpdateCart = useCallback(
    (product: Product, delta: number) => {
      if (delta > 0) {
        const item = cartItems.find((i) => i.id === product.id);
        if (item) {
          updateQuantity(product.id, delta);
        } else {
          addToCart(product, delta);
        }
      } else {
        updateQuantity(product.id, delta);
      }
    },
    [cartItems, updateQuantity, addToCart],
  );

  // ─── Setter wrappers (trigger loading indicator) ──────────────────────────────

  const setSearchQuery = useCallback((q: string) => {
    setIsLoading(true);
    setSearchQueryState(q);
  }, []);

  const setActiveSort = useCallback((sort: string) => {
    setIsLoading(true);
    setActiveSortState(sort);
  }, []);

  const setInStockOnly = useCallback((v: boolean) => {
    setIsLoading(true);
    setInStockOnlyState(v);
  }, []);

  const setOutOfStockOnly = useCallback((v: boolean) => {
    setIsLoading(true);
    setOutOfStockOnlyState(v);
  }, []);

  const setFilterPrice = useCallback((v: string | null) => {
    setIsLoading(true);
    setFilterPriceState(v);
  }, []);

  const setFilterCategoryId = useCallback((v: string | null) => {
    setIsLoading(true);
    setFilterCategoryIdState(v);
  }, []);

  const setFilterSubCategoryId = useCallback((v: string | null) => {
    setIsLoading(true);
    setFilterSubCategoryIdState(v);
  }, []);

  const setFilterTag = useCallback((v: string | null) => {
    setIsLoading(true);
    setFilterTagState(v);
  }, []);

  // ─── Derived ─────────────────────────────────────────────────────────────────

  const hasActiveFilters = !!(filterCategoryId || filterSubCategoryId || filterPrice || filterTag || inStockOnly || outOfStockOnly);

  return {
    products,
    isLoading,
    isInitialLoad,
    isRefreshing,
    hasMore,
    searchQuery,
    setSearchQuery,
    activeSort,
    setActiveSort,
    inStockOnly,
    setInStockOnly,
    outOfStockOnly,
    setOutOfStockOnly,
    filterPrice,
    setFilterPrice,
    filterCategoryId,
    setFilterCategoryId,
    filterSubCategoryId,
    setFilterSubCategoryId,
    filterTag,
    setFilterTag,
    isGridFormat,
    setIsGridFormat,
    handleRefresh,
    handleLoadMore,
    handleUpdateCart,
    hasActiveFilters,
  };
}
