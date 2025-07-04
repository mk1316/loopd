'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAppTracking, fetchUsageForDays } from '@/hooks/useAppTracking';
import { useBlocking } from '@/hooks/useBlocking';
import { 
  CurrentAppDisplay, 
  DeviceIdDisplay, 
  UsageDataDisplay, 
  ProtectedRoute,
  SyncStatus,
  UserProfile,
  ClearDataButton
} from '@/components';
import { BlockScreen } from '@/components/BlockScreen';
import { BlockRulesManager } from '@/components/BlockRulesManager';
import { BlockingTest } from '@/components/BlockingTest';
import { APP_CONSTANTS } from '@/lib/constants';
import { listen } from '@tauri-apps/api/event';
import { DatePicker } from '@/components/ui/date-picker';

function Dashboard() {
  const {
    sessions,
    currentApp,
    lastUpdate,
    deviceId,
    isClearing,
    blockRules,
    fetchBlockRules,
    clearAllData,
  } = useAppTracking();

  const {
    currentBlockStatus,
    handleOverride,
    refreshBlockingRules,
  } = useBlocking(deviceId);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Aggregate sessions for the selected date into usage summary
  const usage = useMemo(() => {
    if (!selectedDate) return [];
    // Filter sessions for the selected date
    const filteredSessions = sessions.filter(session => {
      const sessionDate = new Date(session.start_time);
      return (
        sessionDate.getFullYear() === selectedDate.getFullYear() &&
        sessionDate.getMonth() === selectedDate.getMonth() &&
        sessionDate.getDate() === selectedDate.getDate()
      );
    });
    // Aggregate by app_name
    const usageMap = new Map<string, { day: string; app_name: string; total_seconds: number }>();
    filteredSessions.forEach(session => {
      if (!session.duration_sec) return;
      const day = session.start_time.slice(0, 10); // YYYY-MM-DD
      const key = `${day}-${session.app_name}`;
      if (!usageMap.has(key)) {
        usageMap.set(key, { day, app_name: session.app_name, total_seconds: 0 });
      }
      usageMap.get(key)!.total_seconds += session.duration_sec;
    });
    // Convert to array and sort descending by total_seconds
    return Array.from(usageMap.values()).sort((a, b) => b.total_seconds - a.total_seconds);
  }, [sessions, selectedDate]);

  // Calculate total usage for the selected day
  const totalUsageSeconds = usage.reduce((sum, u) => sum + u.total_seconds, 0);
  const totalUsageHours = Math.floor(totalUsageSeconds / 3600);
  const totalUsageMinutes = Math.floor((totalUsageSeconds % 3600) / 60);

  useEffect(() => {
    // Add global click handler to debug
    const handleGlobalClick = (event: MouseEvent) => {
      console.log('Global click detected:', event.target);
      console.log('Click coordinates:', event.clientX, event.clientY);
    };

    // Add Tauri event listener test
    const setupTauriEvents = async () => {
      try {
        console.log('Setting up Tauri event listener...');
        await listen('test-event', (event) => {
          console.log('Tauri event received:', event);
        });
        console.log('Tauri event listener set up successfully');
        
        // Test emit after 2 seconds
        setTimeout(async () => {
          try {
            console.log('Testing Tauri event emit...');
            const { emit } = await import('@tauri-apps/api/event');
            await emit('test-event', { message: 'Hello from frontend!' });
            console.log('Tauri event emit test completed');
          } catch (error) {
            console.error('Tauri event emit test failed:', error);
          }
        }, 2000);
      } catch (error) {
        console.error('Failed to set up Tauri event listener:', error);
      }
    };

    document.addEventListener('click', handleGlobalClick);
    setupTauriEvents();
    
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="app-container p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                {APP_CONSTANTS.TITLE}
              </h1>
              <p className="text-lg md:text-xl text-slate-300 font-medium">
                {APP_CONSTANTS.DESCRIPTION}
              </p>
            </div>
          </div>
          <div className="mb-4 flex justify-end">
            <DatePicker date={selectedDate} setDate={setSelectedDate} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CurrentAppDisplay currentApp={currentApp} lastUpdate={lastUpdate} />
            <DeviceIdDisplay deviceId={deviceId} />
            <div className="active-app-card rounded-xl p-6 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
                <h2 className="text-xl font-semibold text-blue-300">
                  Total Usage Today
                </h2>
              </div>
              <p className="app-name text-2xl font-mono mb-3">{totalUsageHours}h {totalUsageMinutes}m</p>
              {selectedDate && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-400/70">Date:</span>
                  <span className="text-sm text-blue-300 font-mono">
                    {selectedDate.toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="app-container p-6 md:p-8">
          <UsageDataDisplay usage={usage} />
        </div>
        
        <div className="app-container p-6 md:p-8">
          <BlockRulesManager 
            blockRules={blockRules} 
            deviceId={deviceId} 
            onRefresh={() => {
              fetchBlockRules();
              refreshBlockingRules();
            }}
          />
        </div>

        {/* Development Testing Component */}
        {process.env.NODE_ENV === 'development' && (
          <div className="app-container p-6 md:p-8">
            <BlockingTest deviceId={deviceId} />
          </div>
        )}
      </div>
      
      {/* Block Screen Overlay */}
      {currentBlockStatus?.is_blocked && (
        <BlockScreen 
          blockStatus={currentBlockStatus} 
          deviceId={deviceId}
          onOverride={handleOverride}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
