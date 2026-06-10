import { useState, useEffect } from 'react';
import type { SubCategory } from '../core/types/domain';
import { MOCK_SUB_CATEGORIES } from '../data/mockData';

interface UseSubCategoriesResult {
  subCategories: SubCategory[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useSubCategories(categoryId: string | null): UseSubCategoriesResult {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubCategories = async (catId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      const filtered = MOCK_SUB_CATEGORIES.filter(sc => sc.categoryId === catId);
      setSubCategories(filtered);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error('Failed to fetch sub-categories'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchSubCategories(categoryId);
    } else {
      setSubCategories([]);
      setIsLoading(false);
    }
  }, [categoryId]);

  const refresh = async () => {
    if (categoryId) {
      await fetchSubCategories(categoryId);
    }
  };

  return { subCategories, isLoading, error, refresh };
}
