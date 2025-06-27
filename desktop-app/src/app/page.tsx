'use client';

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

// UsageEntry is a tuple: [app name, seconds used]
type UsageEntry = [string, number];

export default function Home() {
  const [usage, setUsage] = useState<UsageEntry[]>([]);
  const [currentApp, setCurrentApp] = useState<string>('Unknown');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch usage data
  const fetchUsage = async () => {
    try {
      const data = await invoke<UsageEntry[]>('get_usage_summary');
      console.log('Fetched usage data:', data);
      setUsage(data);
      setLastUpdate(new Date());
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

  useEffect(() => {
    fetchUsage(); // initial load
    fetchCurrentApp(); // initial load

    // Listen for "switched" events and refresh usage
    let unlisten: (() => void) | undefined;
    listen('switched', () => {
      console.log('App switched event:');
      fetchUsage();
      fetchCurrentApp();
    }).then((fn) => {
      unlisten = fn;
    });

    // Also refresh every 5 seconds to catch any missed updates
    const interval = setInterval(() => {
      fetchUsage();
      fetchCurrentApp();
    }, 5000);

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Loopd - App Usage Tracker
        </h1>
        
        {/* Current App Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            Currently Active
          </h2>
          <p className="text-blue-600 font-mono">{currentApp}</p>
          <p className="text-sm text-blue-500 mt-1">
            Last updated: {lastUpdate.toLocaleTimeString()}
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
              {usage.map(([app, seconds]) => (
                <div key={app} className="border border-gray-200 rounded p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold">{app}</span>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <div className="font-mono">{formatTime(seconds)}</div>
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
