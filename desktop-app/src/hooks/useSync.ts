import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useUser } from '@/contexts/UserContext';
import { logError } from '@/lib/errorHandling';

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: string | null;
  unsyncedCount: number;
  error: string | null;
}

export function useSync() {
  const { user, session } = useUser();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncTime: null,
    unsyncedCount: 0,
    error: null,
  });

  const [deviceId, setDeviceId] = useState<string>('');

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

  // Check for unsynced sessions
  const checkUnsyncedSessions = async () => {
    if (!deviceId) return;

    try {
      const unsyncedSessions = await invoke<any[]>('get_unsynced_sessions_command', { deviceId });
      setSyncStatus(prev => ({
        ...prev,
        unsyncedCount: unsyncedSessions.length,
        error: null,
      }));
    } catch (e) {
      logError(e, 'checkUnsyncedSessions');
      setSyncStatus(prev => ({
        ...prev,
        error: 'Failed to check unsynced sessions',
      }));
    }
  };

  // Manual sync function
  const syncData = async () => {
    if (!user || !deviceId || !session) {
      setSyncStatus(prev => ({
        ...prev,
        error: 'User not authenticated or device ID not available',
      }));
      return;
    }

    setSyncStatus(prev => ({
      ...prev,
      isSyncing: true,
      error: null,
    }));

    try {
      // Get Supabase credentials from environment
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration not found');
      }

      // Get the user's access token for authenticated requests
      const accessToken = session.access_token;

      // Call the sync command with the access token
      await invoke('sync_data_command', {
        deviceId,
        userId: user.id,
        supabaseUrl,
        supabaseKey,
        accessToken,
      });

      // Update sync status
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date().toISOString(),
        unsyncedCount: 0,
        error: null,
      }));

      // After sync, check for any remaining unsynced sessions to update the UI
      await checkUnsyncedSessions();

      console.log('Sync completed successfully');
    } catch (e) {
      logError(e, 'syncData');
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: e instanceof Error ? e.message : 'Sync failed',
      }));
    }
  };

  // Test Supabase connection
  const testConnection = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      setSyncStatus(prev => ({
        ...prev,
        error: 'Supabase configuration not found',
      }));
      return false;
    }

    try {
      await invoke('test_supabase_connection_command', {
        supabaseUrl,
        supabaseKey,
      });
      setSyncStatus(prev => ({
        ...prev,
        error: null,
      }));
      return true;
    } catch (e) {
      logError(e, 'testConnection');
      setSyncStatus(prev => ({
        ...prev,
        error: 'Failed to connect to Supabase',
      }));
      return false;
    }
  };

  // Auto-sync when user logs in
  useEffect(() => {
    if (user && deviceId) {
      checkUnsyncedSessions();
    }
  }, [user, deviceId]);

  // Periodic batch sync (every 30 seconds)
  useEffect(() => {
    if (!user || !deviceId) return;

    const interval = setInterval(() => {
      syncData();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, deviceId]);

  return {
    syncStatus,
    syncData,
    testConnection,
    checkUnsyncedSessions,
    deviceId,
  };
} 