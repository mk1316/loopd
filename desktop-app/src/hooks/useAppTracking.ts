import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { UsageSummary } from '@/types';
import { REFRESH_INTERVAL, ERROR_MESSAGES } from '@/lib/constants';
import { getCurrentTimeString } from '@/lib/timeUtils';
import { logError } from '@/lib/errorHandling';

export function useAppTracking() {
  const [usage, setUsage] = useState<UsageSummary[]>([]);
  const [currentApp, setCurrentApp] = useState<string>('Unknown');
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>('');
  const [isClearing, setIsClearing] = useState<boolean>(false);

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

  const clearAllData = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear all usage data? This action cannot be undone.'
    );
    
    if (!confirmed) return;
    
    setIsClearing(true);
    try {
      await invoke('clear_all_data_and_reset_command');
      console.log('All data cleared and tracking reset successfully');
      setUsage([]);
      setLastUpdate(getCurrentTimeString());
    } catch (e) {
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

  return {
    usage,
    currentApp,
    lastUpdate,
    deviceId,
    isClearing,
    fetchUsage,
    fetchCurrentApp,
    fetchDeviceId,
    clearAllData,
  };
} 