// Admin Data Fetching Hook
// خطاف جلب بيانات نظام الإدارة

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UseAdminDataOptions {
  /** Auto-fetch on mount (default: true) */
  autoFetch?: boolean;
}

export interface UseAdminDataReturn<T> {
  /** The fetched data */
  data: T | null;
  /** Whether data is currently being loaded */
  loading: boolean;
  /** Error message if the fetch failed */
  error: string | null;
  /** Manually refetch the data */
  refetch: () => Promise<void>;
  /** Set data directly (useful for optimistic updates) */
  setData: (data: T | null) => void;
}

/**
 * Custom hook for admin data fetching with loading/error states.
 */
export function useAdminData<T>(
  fetchFn: () => Promise<T>,
  options: UseAdminDataOptions = {}
): UseAdminDataReturn<T> {
  const { autoFetch = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البيانات';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    if (autoFetch) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, error, refetch, setData };
}

/**
 * Hook for managing paginated admin data.
 */
export interface UsePaginatedAdminDataOptions {
  /** Items per page (default: 10) */
  pageSize?: number;
}

export interface UsePaginatedAdminDataReturn<T> {
  /** The current page of items */
  data: T[];
  /** All loaded items */
  allItems: T[];
  /** Whether data is currently being loaded */
  loading: boolean;
  /** Error message if the fetch failed */
  error: string | null;
  /** Current page number (1-based) */
  page: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items */
  total: number;
  /** Go to the next page */
  nextPage: () => void;
  /** Go to the previous page */
  prevPage: () => void;
  /** Go to a specific page */
  setPage: (page: number) => void;
  /** Refetch the data */
  refetch: () => Promise<void>;
  /** Set all items directly */
  setAllItems: (items: T[]) => void;
}

export function usePaginatedAdminData<T>(
  fetchFn: () => Promise<T[]>,
  options: UsePaginatedAdminDataOptions = {}
): UsePaginatedAdminDataReturn<T> {
  const { pageSize = 10 } = options;
  const [allItems, setAllItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(allItems.length / pageSize);
  const data = allItems.slice((page - 1) * pageSize, page * pageSize);
  const total = allItems.length;

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setAllItems(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البيانات';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setPage((p) => Math.max(p - 1, 1));

  return {
    data,
    allItems,
    loading,
    error,
    page,
    totalPages,
    total,
    nextPage,
    prevPage,
    setPage,
    refetch,
    setAllItems,
  };
}
