import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { UsageSummary, Session, BlockRule, BlockStatus } from '@/types';
import { REFRESH_INTERVAL } from '@/lib/constants';
import { getCurrentTimeString } from '@/lib/timeUtils';
import { logError } from '@/lib/errorHandling';

// TypeScript declaration for Tauri global
declare global {
  interface Window {
    __TAURI__?: any;
  }
}

export function useAppTracking() {
  const [usage, setUsage] = useState<UsageSummary[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentApp, setCurrentApp] = useState<string>('Unknown');
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>('');
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [blockRules, setBlockRules] = useState<BlockRule[]>([]);
  const [currentBlockStatus, setCurrentBlockStatus] = useState<BlockStatus | null>(null);
  const [isBlockingEnabled] = useState<boolean>(true);

  // --- PATCH OPEN SESSIONS ON STARTUP ---
  useEffect(() => {
    // Only run once on mount
    (async () => {
      const lastActiveTime = localStorage.getItem('loopd_lastActiveTime');
      if (lastActiveTime && deviceId) {
        try {
          // Call a backend command to patch open sessions for this device
          await invoke('patch_open_sessions_with_end_time', {
            deviceId,
            endTime: lastActiveTime,
          });
        } catch (e) {
          logError(e, 'patchOpenSessions');
        }
      }
    })();
  }, [deviceId]);

  // --- UPDATE lastActiveTime EVERY 15s AND ON USER ACTIVITY ---
  useEffect(() => {
    const update = () => localStorage.setItem('loopd_lastActiveTime', new Date().toISOString());
    const interval = setInterval(update, 15000);
    window.addEventListener('mousemove', update);
    window.addEventListener('keydown', update);
    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', update);
      window.removeEventListener('keydown', update);
    };
  }, []);

  const fetchUsage = async () => {
    try {
      const data = await invoke<UsageSummary[]>('get_usage_summary');
      setUsage(data);
      setLastUpdate(getCurrentTimeString());
    } catch (e) {
      logError(e, 'fetchUsage');
      setUsage([]);
    }
  };

  const fetchSessions = async () => {
    try {
      const data = await invoke<Session[]>('get_sessions_command', { 
        deviceId, 
        limit: 1000 
      });
      setSessions(data);
    } catch (e) {
      logError(e, 'fetchSessions');
      setSessions([]);
    }
  };

  const fetchCurrentApp = async () => {
    try {
      const app = await invoke<string>('get_active_app');
      setCurrentApp(app);
    } catch (e) {
      logError(e, 'fetchCurrentApp');
      setCurrentApp('Error');
    }
  };

  const fetchDeviceId = async () => {
    try {
      const id = await invoke<string>('get_app_device_id');
      setDeviceId(id);
    } catch (e) {
      logError(e, 'fetchDeviceId');
      setDeviceId('Error');
    }
  };

  const fetchBlockRules = async () => {
    if (!deviceId) return;
    try {
      const rules = await invoke<BlockRule[]>('get_block_rules_command', { deviceId });
      setBlockRules(rules);
    } catch (e) {
      logError(e, 'fetchBlockRules');
      setBlockRules([]);
    }
  };

  const evaluateBlockStatus = async () => {
    if (!deviceId || !currentApp || !isBlockingEnabled) {
      setCurrentBlockStatus(null);
      return;
    }
    try {
      const status = await invoke<BlockStatus>('evaluate_block_status_command', {
        deviceId,
        appName: currentApp,
      });
      setCurrentBlockStatus(status);
    } catch (e) {
      logError(e, 'evaluateBlockStatus');
      setCurrentBlockStatus(null);
    }
  };

  const clearAllData = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear all usage data? This action cannot be undone.'
    );
    
    if (!confirmed) return;
    
    console.log('clearAllData: Starting clear operation...');
    console.log('clearAllData: invoke function available:', typeof invoke);
    console.log('clearAllData: window.__TAURI__ available:', !!window.__TAURI__);
    
    setIsClearing(true);
    try {
      console.log('clearAllData: Calling invoke...');
      
      // Try the command without arguments first
      const result = await invoke('clear_all_data_and_reset_command');
      console.log('clearAllData: Command result:', result);
      
      console.log('clearAllData: All data cleared and tracking reset successfully');
      setUsage([]);
      setSessions([]);
      setLastUpdate(getCurrentTimeString());
    } catch (e) {
      console.error('clearAllData: Error occurred:', e);
      console.error('clearAllData: Error type:', typeof e);
      console.error('clearAllData: Error message:', e instanceof Error ? e.message : String(e));
      logError(e, 'clearAllData');
      alert('Failed to clear data. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchUsage();
    fetchCurrentApp();
    fetchDeviceId();

    // Set up event listener for app switches
    const unlistenPromise = listen('switched', () => {
      fetchUsage();
      fetchCurrentApp();
    });

    // Set up interval for periodic updates
    const interval = setInterval(() => {
      fetchUsage();
      fetchCurrentApp();
    }, REFRESH_INTERVAL);

    // Cleanup function
    return () => {
      unlistenPromise.then(unlisten => unlisten());
      clearInterval(interval);
    };
  }, []);

  // Fetch sessions when deviceId is available
  useEffect(() => {
    if (deviceId) {
      fetchSessions();
      fetchBlockRules();
    }
  }, [deviceId]);

  // Evaluate block status when currentApp or blockRules change
  useEffect(() => {
    evaluateBlockStatus();
  }, [currentApp, blockRules, isBlockingEnabled]);

  return {
    usage,
    sessions,
    currentApp,
    lastUpdate,
    deviceId,
    isClearing,
    blockRules,
    currentBlockStatus,
    isBlockingEnabled,
    fetchUsage,
    fetchSessions,
    fetchCurrentApp,
    fetchDeviceId,
    fetchBlockRules,
    evaluateBlockStatus,
    clearAllData,
  };
} 