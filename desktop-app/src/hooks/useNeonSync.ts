import { useState, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { NeonEvent, NeonBucket, NeonSyncStatus } from '@/types';

/**
 * Hook for syncing data with Neon cloud database
 */
export function useNeonSync() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<NeonSyncStatus>({
    connected: false,
    pendingEvents: 0,
  });
  const connectionStringRef = useRef<string | null>(null);

  // ========== Connection ==========

  const setConnectionString = useCallback((connectionString: string) => {
    connectionStringRef.current = connectionString;
  }, []);

  const testConnection = useCallback(async (connectionString?: string): Promise<boolean> => {
    const connStr = connectionString || connectionStringRef.current;
    if (!connStr) {
      setError('No connection string provided');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      await invoke('neon_test_connection', { connectionString: connStr });
      setSyncStatus(prev => ({ ...prev, connected: true, error: undefined }));
      if (connectionString) {
        connectionStringRef.current = connectionString;
      }
      return true;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      setError(errorMsg);
      setSyncStatus(prev => ({ ...prev, connected: false, error: errorMsg }));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const initSchema = useCallback(async (connectionString?: string): Promise<boolean> => {
    const connStr = connectionString || connectionStringRef.current;
    if (!connStr) {
      setError('No connection string provided');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      await invoke('neon_init_schema', { connectionString: connStr });
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== Sync Operations ==========

  const syncBucket = useCallback(async (
    bucket: NeonBucket,
    connectionString?: string
  ): Promise<boolean> => {
    const connStr = connectionString || connectionStringRef.current;
    if (!connStr) {
      setError('No connection string provided');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      await invoke('neon_sync_bucket', { connectionString: connStr, bucket });
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const syncEvents = useCallback(async (
    events: NeonEvent[],
    connectionString?: string
  ): Promise<number> => {
    const connStr = connectionString || connectionStringRef.current;
    if (!connStr) {
      setError('No connection string provided');
      return 0;
    }

    try {
      setLoading(true);
      setError(null);
      const synced = await invoke<number>('neon_sync_events', {
        connectionString: connStr,
        events,
      });
      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date().toISOString(),
        pendingEvents: Math.max(0, prev.pendingEvents - synced),
      }));
      return synced;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== Query Operations ==========

  const getEvents = useCallback(async (
    deviceId: string,
    options?: {
      bucketId?: string;
      start?: string;
      end?: string;
      limit?: number;
    },
    connectionString?: string
  ): Promise<NeonEvent[]> => {
    const connStr = connectionString || connectionStringRef.current;
    if (!connStr) {
      setError('No connection string provided');
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      return await invoke<NeonEvent[]>('neon_get_events', {
        connectionString: connStr,
        deviceId,
        bucketId: options?.bucketId,
        start: options?.start,
        end: options?.end,
        limit: options?.limit,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getBuckets = useCallback(async (
    deviceId: string,
    connectionString?: string
  ): Promise<NeonBucket[]> => {
    const connStr = connectionString || connectionStringRef.current;
    if (!connStr) {
      setError('No connection string provided');
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      return await invoke<NeonBucket[]>('neon_get_buckets', {
        connectionString: connStr,
        deviceId,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== Utility ==========

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updatePendingCount = useCallback((count: number) => {
    setSyncStatus(prev => ({ ...prev, pendingEvents: count }));
  }, []);

  return {
    // State
    loading,
    error,
    syncStatus,

    // Connection
    setConnectionString,
    testConnection,
    initSchema,

    // Sync
    syncBucket,
    syncEvents,

    // Query
    getEvents,
    getBuckets,

    // Utility
    clearError,
    updatePendingCount,
  };
}
