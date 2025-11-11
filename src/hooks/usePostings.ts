import { useState, useEffect } from 'react';
import * as postingsService from '../api/postings';
import type { PostingFilters } from '../api/postings';
import type { Posting } from '../types';

interface UsePostingsReturn {
  postings: Posting[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const usePostings = (filters?: PostingFilters): UsePostingsReturn => {
  const [postings, setPostings] = useState<Posting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPostings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await postingsService.getPostings(filters);
      setPostings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch postings');
      setPostings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.division, filters?.state, filters?.position, filters?.graduationYear]); // Re-fetch when filters change

  return {
    postings,
    loading,
    error,
    refetch: fetchPostings,
  };
};

/**
 * Hook to fetch recommended postings for the current player
 * Backend calculates match scores and excludes already-applied postings
 */
export const useRecommendedPostings = (limit?: number): UsePostingsReturn => {
  const [postings, setPostings] = useState<Posting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommended = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await postingsService.getRecommendedPostings(limit);
      setPostings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch recommended postings');
      setPostings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommended();
  }, [limit]);

  return {
    postings,
    loading,
    error,
    refetch: fetchRecommended,
  };
};

interface UseSearchPostingsReturn {
  postings: Posting[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to search postings with filters
 */
export const useSearchPostings = (filters?: PostingFilters): UseSearchPostingsReturn => {
  const [postings, setPostings] = useState<Posting[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await postingsService.searchPostings(filters);
      setPostings(data.postings);
      setTotal(data.total);
      setPage(data.page);
      setLimit(data.limit);
    } catch (err: any) {
      setError(err.message || 'Failed to search postings');
      setPostings([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.division, filters?.state, filters?.position, filters?.graduationYear, filters?.school_name, filters?.page, filters?.limit]);

  return {
    postings,
    total,
    page,
    limit,
    loading,
    error,
    refetch: fetchSearch,
  };
};

