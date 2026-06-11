import { useState, useEffect, useCallback } from 'react';
import type { Category } from '../core/types/domain';
import { categoryApi } from '../services/categoryApi';

interface UseCategoriesResult {
  categories: Category[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await categoryApi.getCategories(forceRefresh);
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        throw new Error(response.error || 'Failed to load categories');
      }
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err.message || 'Failed to fetch categories'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { 
    categories, 
    isLoading, 
    error, 
    refresh: () => fetchCategories(true) 
  };
}
