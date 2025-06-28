'use client';

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

// UsageSummary matches the Rust struct
type UsageSummary = {
  day: string;
  app_name: string;
  total_seconds: number;
};

export default function Home() {
  const [usage, setUsage] = useState<UsageSummary[]>([]);
  const [currentApp, setCurrentApp] = useState<string>('Unknown');
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [deviceId, setDeviceId] = useState<string>('');

  // Fetch usage data
  const fetchUsage = async () => {
    try {
      const data = await invoke<UsageSummary[]>('get_usage_summary');
      console.log('Fetched usage data:', data);
      setUsage(data);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (e) {
      console.error('Error fetching usage data:', e);
      setUsage([]);
    }
  };

  // Get current active app
  const fetchCurrentApp = async () => {
    try {
      const app = await invoke<string>('get_active_app');
      setCurrentApp(app);
    } catch (e) {
      console.error('Error fetching current app:', e);
      setCurrentApp('Error');
    }
  };

  // Get device ID
  const fetchDeviceId = async () => {
    try {
      const id = await invoke<string>('get_app_device_id');
      setDeviceId(id);
    } catch (e) {
      console.error('Error fetching device ID:', e);
      setDeviceId('Error');
    }
  };

  // Clear all data
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
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (e) {
      console.error('Error clearing data:', e);
      alert('Failed to clear data. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  useEffect(() => {
    fetchUsage(); // initial load
    fetchCurrentApp(); // initial load
    fetchDeviceId(); // initial load

    // Listen for "switched" events and refresh usage
    let unlisten: (() => void) | undefined;
    listen('switched', () => {
      console.log('App switched event:');
      fetchUsage();
      fetchCurrentApp();
    }).then((fn) => {
      unlisten = fn;
    });

    // Also refresh every second to catch any missed updates
    const interval = setInterval(() => {
      fetchUsage();
      fetchCurrentApp();
    }, 1000);

    return () => {
      if (unlisten) unlisten();
      clearInterval(interval);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Loopd - App Usage Tracker
          </h1>
          <button
            onClick={clearAllData}
            disabled={isClearing}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            {isClearing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Clearing...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All Data
              </>
            )}
          </button>
        </div>
        
        {/* Current App Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            Currently Active
          </h2>
          <p className="text-blue-600 font-mono">{currentApp}</p>
          {lastUpdate && (
            <p className="text-sm text-blue-500 mt-1">
              Last updated: {lastUpdate}
            </p>
          )}
        </div>

        {/* Device ID Display */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-green-800 mb-2">
            Device ID
          </h2>
          <p className="text-green-600 font-mono text-sm break-all">{deviceId}</p>
          <p className="text-xs text-green-500 mt-1">
            This ID persists across app restarts and data clearing
          </p>
        </div>

        {/* Usage Data */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Usage Data
          </h2>
          {usage.length === 0 ? (
            <div className="text-gray-500">
              <p>No usage data available yet. Start tracking to see data.</p>
              <p className="text-sm mt-2">
                Try switching between different applications to see usage tracking in action.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {usage.map((summary) => (
                <div key={`${summary.day}-${summary.app_name}`} className="border border-gray-200 rounded p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold">{summary.app_name}</span>
                      <div className="text-sm text-gray-500">{summary.day}</div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <div className="font-mono">{formatTime(summary.total_seconds)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
