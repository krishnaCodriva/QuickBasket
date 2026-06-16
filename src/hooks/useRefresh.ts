import { useState, useCallback } from 'react';

export const useRefresh = (fetchData: () => Promise<any>) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchData]);

  return { refreshing, onRefresh };
};
