import { useState, useEffect, useCallback } from 'react';
import type { Product } from '../core/types/domain';
import { productApi } from '../services/productApi';

interface UseProductDetailResult {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useProductDetail(productId: string | undefined): UseProductDetailResult {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await productApi.getProductById(productId);
      if (response.success && response.data) {
        setProduct(response.data);
      } else {
        setError(response.error || 'Failed to fetch product details');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, isLoading, error, refresh: fetchProduct };
}
