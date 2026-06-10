import { useState, useEffect } from 'react';
import type { Category } from '../core/types/domain';
import { CATEGORIES } from '../data/mockData';

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

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setCategories(CATEGORIES);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error('Failed to fetch categories'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, isLoading, error, refresh: fetchCategories };
}
