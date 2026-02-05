import { useState, useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { logError } from '@/lib/errorHandling';
import type { AWBucket, AWEvent, NeonBucket, NeonEvent } from '@/types';

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: string | null;
  unsyncedCount: number;
  error: string | null;
  connected: boolean;
}

export interface SyncConfig {
  connectionString: string;
  autoSync?: boolean;
  syncInterval?: number; // milliseconds, default 30000
}

/**
 * Hook for syncing ActivityWatch data with Neon cloud database
 */
export function useSync(config?: SyncConfig) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncTime: null,
    unsyncedCount: 0,
    error: null,
    connected: false,
  });

  const [deviceId, setDeviceId] = useState<string>('');
  const connectionStringRef = useRef<string | null>(config?.connectionString || null);

  // Get device ID on mount
  useEffect(() => {
    const fetchDeviceId = async () => {
      try {
        const id = await invoke<string>('get_app_device_id');
        setDeviceId(id);
      } catch (e) {
        logError(e, 'fetchDeviceId');
      }
    };
    fetchDeviceId();
  }, []);

  // Update connection string when config changes
  useEffect(() => {
    if (config?.connectionString) {
      connectionStringRef.current = config.connectionString;
    }
  }, [config?.connectionString]);

  // Set connection string
  const setConnectionString = useCallback((connectionString: string) => {
    connectionStringRef.current = connectionString;
  }, []);

  // Test Neon connection
  const testConnection = useCallback(async (connectionString?: string) => {
    const connStr = connectionString || connectionStringRef.current;
    if (!connStr) {
      setSyncStatus(prev => ({
        ...prev,
        error: 'No Neon connection string configured',
        connected: false,
      }));
      return false;
    }

    try {
      await invoke('neon_test_connection', { connectionString: connStr });
      if (connectionString) {
        connectionStringRef.current = connectionString;
      }
      setSyncStatus(prev => ({
        ...prev,
        error: null,
        connected: true,
      }));
      return true;
    } catch (e) {
      logError(e, 'testConnection');
      setSyncStatus(prev => ({
        ...prev,
        error: 'Failed to connect to Neon',
        connected: false,
      }));
      return false;
    }
  }, []);

  // Initialize Neon schema
  const initSchema = useCallback(async () => {
    const connStr = connectionStringRef.current;
    if (!connStr) {
      setSyncStatus(prev => ({
        ...prev,
        error: 'No Neon connection string configured',
      }));
      return false;
    }

    try {
      await invoke('neon_init_schema', { connectionString: connStr });
      return true;
    } catch (e) {
      logError(e, 'initSchema');
      setSyncStatus(prev => ({
        ...prev,
        error: 'Failed to initialize Neon schema',
      }));
      return false;
    }
  }, []);

  // Get unsynced events count from local AW database
  const checkUnsyncedEvents = useCallback(async () => {
    if (!deviceId) return;

    try {
      // Get buckets and count events
      const buckets = await invoke<Record<string, AWBucket>>('aw_get_buckets');
      let totalEvents = 0;

      for (const bucketId of Object.keys(buckets)) {
        const count = await invoke<number>('aw_get_event_count', { bucketId });
        totalEvents += count;
      }

      setSyncStatus(prev => ({
        ...prev,
        unsyncedCount: totalEvents,
        error: null,
      }));
    } catch (e) {
      logError(e, 'checkUnsyncedEvents');
      setSyncStatus(prev => ({
        ...prev,
        error: 'Failed to check unsynced events',
      }));
    }
  }, [deviceId]);

  // Sync buckets to Neon
  const syncBuckets = useCallback(async () => {
    const connStr = connectionStringRef.current;
    if (!connStr || !deviceId) {
      return false;
    }

    try {
      const buckets = await invoke<Record<string, AWBucket>>('aw_get_buckets');

      for (const bucket of Object.values(buckets)) {
        const neonBucket: NeonBucket = {
          id: bucket.id,
          device_id: deviceId,
          name: bucket.name,
          bucket_type: bucket.type,
          client: bucket.client,
          hostname: bucket.hostname,
          created: bucket.created,
          data: bucket.data,
        };

        await invoke('neon_sync_bucket', {
          connectionString: connStr,
          bucket: neonBucket,
        });
      }
      return true;
    } catch (e) {
      logError(e, 'syncBuckets');
      return false;
    }
  }, [deviceId]);

  // Sync events to Neon
  const syncEvents = useCallback(async (bucketId?: string, limit?: number) => {
    const connStr = connectionStringRef.current;
    if (!connStr || !deviceId) {
      setSyncStatus(prev => ({
        ...prev,
        error: 'Not configured for sync',
      }));
      return 0;
    }

    try {
      const buckets = await invoke<Record<string, AWBucket>>('aw_get_buckets');
      const bucketIds = bucketId ? [bucketId] : Object.keys(buckets);
      let totalSynced = 0;

      for (const bid of bucketIds) {
        const events = await invoke<AWEvent[]>('aw_get_events', {
          bucketId: bid,
          limit: limit || 1000,
        });

        if (events.length === 0) continue;

        const neonEvents: NeonEvent[] = events.map(event => ({
          id: event.id,
          bucket_id: bid,
          device_id: deviceId,
          timestamp: event.timestamp,
          duration: event.duration,
          data: event.data,
        }));

        const synced = await invoke<number>('neon_sync_events', {
          connectionString: connStr,
          events: neonEvents,
        });

        totalSynced += synced;
      }

      return totalSynced;
    } catch (e) {
      logError(e, 'syncEvents');
      return 0;
    }
  }, [deviceId]);

  // Full sync function
  const syncData = useCallback(async () => {
    const connStr = connectionStringRef.current;
    if (!connStr || !deviceId) {
      setSyncStatus(prev => ({
        ...prev,
        error: 'Device ID or connection string not available',
      }));
      return;
    }

    setSyncStatus(prev => ({
      ...prev,
      isSyncing: true,
      error: null,
    }));

    try {
      // Sync buckets first
      const bucketsOk = await syncBuckets();
      if (!bucketsOk) {
        throw new Error('Failed to sync buckets');
      }

      // Sync events
      const synced = await syncEvents();

      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date().toISOString(),
        error: null,
      }));

      // Check remaining unsynced
      await checkUnsyncedEvents();

      console.log(`Sync completed: ${synced} events synced`);
    } catch (e) {
      logError(e, 'syncData');
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: e instanceof Error ? e.message : 'Sync failed',
      }));
    }
  }, [deviceId, syncBuckets, syncEvents, checkUnsyncedEvents]);

  // Get events from Neon (cloud)
  const getCloudEvents = useCallback(async (
    options?: {
      bucketId?: string;
      start?: string;
      end?: string;
      limit?: number;
    }
  ): Promise<NeonEvent[]> => {
    const connStr = connectionStringRef.current;
    if (!connStr || !deviceId) {
      return [];
    }

    try {
      return await invoke<NeonEvent[]>('neon_get_events', {
        connectionString: connStr,
        deviceId,
        bucketId: options?.bucketId,
        start: options?.start,
        end: options?.end,
        limit: options?.limit,
      });
    } catch (e) {
      logError(e, 'getCloudEvents');
      return [];
    }
  }, [deviceId]);

  // Get buckets from Neon (cloud)
  const getCloudBuckets = useCallback(async (): Promise<NeonBucket[]> => {
    const connStr = connectionStringRef.current;
    if (!connStr || !deviceId) {
      return [];
    }

    try {
      return await invoke<NeonBucket[]>('neon_get_buckets', {
        connectionString: connStr,
        deviceId,
      });
    } catch (e) {
      logError(e, 'getCloudBuckets');
      return [];
    }
  }, [deviceId]);

  // Auto-sync setup
  useEffect(() => {
    if (!config?.autoSync || !connectionStringRef.current || !deviceId) return;

    // Initial check
    checkUnsyncedEvents();

    const interval = setInterval(() => {
      syncData();
    }, config.syncInterval || 30000);

    return () => clearInterval(interval);
  }, [config?.autoSync, config?.syncInterval, deviceId, syncData, checkUnsyncedEvents]);

  return {
    syncStatus,
    deviceId,
    // Configuration
    setConnectionString,
    // Actions
    testConnection,
    initSchema,
    syncData,
    syncBuckets,
    syncEvents,
    checkUnsyncedEvents,
    // Cloud queries
    getCloudEvents,
    getCloudBuckets,
  };
}
