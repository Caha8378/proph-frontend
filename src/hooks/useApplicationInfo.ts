import { useState, useEffect, useCallback } from 'react';
import * as applicationsService from '../api/applications';

const STORAGE_KEY = 'applicationInfo';
const STORAGE_TIMESTAMP_KEY = 'applicationInfoTimestamp';
const CACHE_DURATION = 30 * 1000; // 30 seconds

interface ApplicationInfo {
  pending_count: number;
  school_id: number | null;
}

interface UseApplicationInfoReturn {
  pendingCount: number;
  schoolId: number | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and cache application info (pending count)
 * Uses localStorage to cache the result and reduce API calls
 */
export const useApplicationInfo = (autoFetch: boolean = true): UseApplicationInfoReturn => {
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [schoolId, setSchoolId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await applicationsService.getApplicationInfo();
      
      setPendingCount(data.pending_count || 0);
      setSchoolId(data.school_id);
      
      // Store in localStorage with timestamp
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
    } catch (err: any) {
      console.error('Error fetching application info:', err);
      setError(err.message || 'Failed to fetch application info');
      // On error, try to use cached value if available
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        try {
          const cachedData = JSON.parse(cached) as ApplicationInfo;
          setPendingCount(cachedData.pending_count || 0);
          setSchoolId(cachedData.school_id);
        } catch {
          // Ignore parse errors
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load from cache on mount
  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    const timestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
    
    if (cached && timestamp) {
      try {
        const cachedData = JSON.parse(cached) as ApplicationInfo;
        const cacheAge = Date.now() - parseInt(timestamp, 10);
        
        // Use cached data immediately
        setPendingCount(cachedData.pending_count || 0);
        setSchoolId(cachedData.school_id);
        
        // If cache is stale, fetch in background
        if (cacheAge > CACHE_DURATION && autoFetch) {
          fetchInfo();
        }
      } catch {
        // If cache is invalid, fetch fresh data
        if (autoFetch) {
          fetchInfo();
        }
      }
    } else if (autoFetch) {
      // No cache, fetch fresh data
      fetchInfo();
    }
  }, [autoFetch, fetchInfo]);

  return {
    pendingCount,
    schoolId,
    loading,
    error,
    refetch: fetchInfo,
  };
};

/**
 * Utility function to refresh application info (useful after accept/reject)
 * This can be called from anywhere to update the cached count
 */
export const refreshApplicationInfo = async (): Promise<void> => {
  try {
    const data = await applicationsService.getApplicationInfo();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error refreshing application info:', error);
  }
};

