import { useState, useEffect, useCallback, useRef } from 'react';
import { categoryApi } from '../services/categoryApi';
import type { Category } from '../core/types/domain';

export interface UsePaginatedCategoriesReturn {
  data: Category[];
  isLoading: boolean;
  isRefreshing: boolean;
  hasMore: boolean;
  page: number;
  handleRefresh: () => void;
  handleLoadMore: () => void;
}

export function usePaginatedCategories(
  parentId: string | null = null, 
  limit: number = 10,
  extraParams: Record<string, any> = {}
): UsePaginatedCategoriesReturn {
  const [data, setData] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isLoadingRef = useRef(false);

  const loadData = useCallback((pageNumber: number, reset = false) => {
    if (isLoadingRef.current && !reset) return;
    isLoadingRef.current = true;
    setIsLoading(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await categoryApi.getPaginatedCategories(pageNumber, limit, parentId, extraParams);
        
        if (response.success && response.data) {
          setData(prev => reset ? response.data : [...prev, ...response.data]);
          setPage(pageNumber);
          setHasMore(response.meta?.page < response.meta?.totalPages || response.data.length === limit);
        }
      } catch (error) {
        console.error('Error fetching paginated categories:', error);
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }, 500);
  }, [parentId, limit, JSON.stringify(extraParams)]);

  useEffect(() => {
    // Reset and load when parentId changes
    isLoadingRef.current = true;
    setIsLoading(true);
    setData([]);
    setPage(1);
    setHasMore(true);
    loadData(1, true);
  }, [parentId, loadData]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadData(1, true);
  }, [loadData]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && data.length > 0) {
      loadData(page + 1);
    }
  }, [hasMore, data.length, page, loadData]);

  return {
    data,
    isLoading,
    isRefreshing,
    hasMore,
    page,
    handleRefresh,
    handleLoadMore,
  };
}
