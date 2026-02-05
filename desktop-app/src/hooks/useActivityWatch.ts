import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type {
  AWBucket,
  AWEvent,
  AWServerInfo,
  AWBucketExport,
  AWUsageSummary,
} from '@/types';

/**
 * Hook for interacting with ActivityWatch-compatible API
 */
export function useActivityWatch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========== Info ==========

  const getInfo = useCallback(async (): Promise<AWServerInfo | null> => {
    try {
      setLoading(true);
      setError(null);
      return await invoke<AWServerInfo>('aw_get_info');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== Buckets ==========

  const getBuckets = useCallback(async (): Promise<Record<string, AWBucket>> => {
    try {
      setLoading(true);
      setError(null);
      return await invoke<Record<string, AWBucket>>('aw_get_buckets');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return {};
    } finally {
      setLoading(false);
    }
  }, []);

  const getBucket = useCallback(async (bucketId: string): Promise<AWBucket | null> => {
    try {
      setLoading(true);
      setError(null);
      return await invoke<AWBucket>('aw_get_bucket', { bucketId });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBucket = useCallback(async (
    bucketId: string,
    bucketType: string,
    client: string,
    hostname: string
  ): Promise<AWBucket | null> => {
    try {
      setLoading(true);
      setError(null);
      return await invoke<AWBucket>('aw_create_bucket', {
        bucketId,
        bucketType,
        client,
        hostname,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBucket = useCallback(async (bucketId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await invoke('aw_delete_bucket', { bucketId });
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== Events ==========

  const getEvents = useCallback(async (
    bucketId: string,
    options?: {
      start?: string;
      end?: string;
      limit?: number;
    }
  ): Promise<AWEvent[]> => {
    try {
      setLoading(true);
      setError(null);
      return await invoke<AWEvent[]>('aw_get_events', {
        bucketId,
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

  const getEvent = useCallback(async (bucketId: string, eventId: number): Promise<AWEvent | null> => {
    try {
      setLoading(true);
      setError(null);
      return await invoke<AWEvent>('aw_get_event', { bucketId, eventId });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const insertEvents = useCallback(async (
    bucketId: string,
    events: AWEvent[]
  ): Promise<AWEvent[]> => {
    try {
      setLoading(true);
      setError(null);
      return await invoke<AWEvent[]>('aw_insert_events', { bucketId, events });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEvent = useCallback(async (bucketId: string, eventId: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      return await invoke<boolean>('aw_delete_event', { bucketId, eventId });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getEventCount = useCallback(async (bucketId: string): Promise<number> => {
    try {
      setLoading(true);
      setError(null);
      return await invoke<number>('aw_get_event_count', { bucketId });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== Heartbeat ==========

  const heartbeat = useCallback(async (
    bucketId: string,
    timestamp: string,
    duration: number,
    data: Record<string, unknown>,
    pulsetime: number = 5.0
  ): Promise<AWEvent | null> => {
    try {
      setLoading(true);
      setError(null);
      return await invoke<AWEvent>('aw_heartbeat', {
        bucketId,
        timestamp,
        duration,
        data,
        pulsetime,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== Query ==========

  const getUsageSummary = useCallback(async (
    bucketId: string,
    options?: {
      start?: string;
      end?: string;
    }
  ): Promise<AWUsageSummary[]> => {
    try {
      setLoading(true);
      setError(null);
      const result = await invoke<[string, number][]>('aw_get_usage_summary', {
        bucketId,
        start: options?.start,
        end: options?.end,
      });
      return result.map(([app, total_seconds]) => ({ app, total_seconds }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getCurrentEvent = useCallback(async (bucketId: string): Promise<AWEvent | null> => {
    try {
      setLoading(true);
      setError(null);
      return await invoke<AWEvent | null>('aw_get_current_event', { bucketId });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== Settings ==========

  const getSetting = useCallback(async (key: string): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      return await invoke<string | null>('aw_get_setting', { key });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const setSetting = useCallback(async (key: string, value: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await invoke('aw_set_setting', { key, value });
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== Export ==========

  const exportBucket = useCallback(async (bucketId: string): Promise<AWBucketExport | null> => {
    try {
      setLoading(true);
      setError(null);
      return await invoke<AWBucketExport>('aw_export_bucket', { bucketId });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAll = useCallback(async (): Promise<Record<string, AWBucketExport>> => {
    try {
      setLoading(true);
      setError(null);
      return await invoke<Record<string, AWBucketExport>>('aw_export_all');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return {};
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    loading,
    error,

    // Info
    getInfo,

    // Buckets
    getBuckets,
    getBucket,
    createBucket,
    deleteBucket,

    // Events
    getEvents,
    getEvent,
    insertEvents,
    deleteEvent,
    getEventCount,

    // Heartbeat
    heartbeat,

    // Query
    getUsageSummary,
    getCurrentEvent,

    // Settings
    getSetting,
    setSetting,

    // Export
    exportBucket,
    exportAll,
  };
}
