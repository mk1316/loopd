'use client';

import { useState, useMemo } from 'react';
import { useAppTracking } from '@/hooks/useAppTracking';
import { useBlocking } from '@/hooks/useBlocking';
import { 
  CurrentAppDisplay, 
  UsageDataDisplay, 
  ProtectedRoute,
  SyncStatus,
  UserProfile,
  ClearDataButton
} from '@/components';
import { BlockingTest } from '@/components/BlockingTest';
import { APP_CONSTANTS } from '@/lib/constants';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header Section */}
        <div className="app-container p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
                {APP_CONSTANTS.TITLE}
              </h1>
              <p className="text-lg md:text-xl text-slate-300 font-medium">
                {APP_CONSTANTS.DESCRIPTION}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <UserProfile />
              <SyncStatus />
            </div>
          </div>
          
          {/* Date Selector */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Usage Overview</h2>
            <DatePicker date={selectedDate} setDate={setSelectedDate} />
          </div>
          
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CurrentAppDisplay currentApp={currentApp} lastUpdate={lastUpdate} />
            <div className="active-app-card rounded-xl p-6 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
                <h2 className="text-xl font-semibold text-blue-300">
                  Total Usage
                </h2>
              </div>
              <p className="app-name text-3xl font-mono mb-3">{totalUsageHours}h {totalUsageMinutes}m</p>
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
        
        {/* Usage Data Section */}
        <div className="app-container p-6 md:p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">App Usage Details</h2>
            <div className="text-sm text-slate-400">
              {usage.length} app{usage.length !== 1 ? 's' : ''} tracked
            </div>
          </div>
          <UsageDataDisplay usage={usage} sessions={sessions} />
        </div>

        {/* Development Testing Component */}
        {process.env.NODE_ENV === 'development' && (
          <div className="app-container p-6 md:p-8">
            <h2 className="text-xl font-semibold text-white mb-4">Development Tools</h2>
            <BlockingTest deviceId={deviceId} />
          </div>
        )}
      </div>
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
