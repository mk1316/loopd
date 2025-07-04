'use client';

import { useMemo, useEffect } from 'react';
import { useAppTracking } from '@/hooks/useAppTracking';
import { 
  CurrentAppDisplay, 
  ProtectedRoute
} from '@/components';
import { APP_CONSTANTS } from '@/lib/constants';

function Dashboard() {
  const {
    sessions,
    currentApp,
    lastUpdate,
    deviceId,
    fetchSessions,
  } = useAppTracking();

  // Calculate total usage for today
  const totalUsageSeconds = sessions
    .filter(session => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const sessionDate = new Date(session.start_time);
      return sessionDate >= todayStart && sessionDate < tomorrowStart;
    })
    .reduce((sum, session) => sum + (session.duration_sec || 0), 0);
  const totalUsageHours = Math.floor(totalUsageSeconds / 3600);
  const totalUsageMinutes = Math.floor((totalUsageSeconds % 3600) / 60);

  // Refresh sessions every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSessions();
    }, 60000); // 60 seconds
    return () => clearInterval(interval);
  }, [fetchSessions]);

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
            </div>
          </div>
          
          {/* Usage Overview Header (no date selector) */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Usage Overview</h2>
          </div>
          
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CurrentAppDisplay currentApp={currentApp} lastUpdate={lastUpdate} />
            <div className="active-app-card rounded-xl p-6 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
                <h2 className="text-xl font-semibold text-blue-300">
                  Total Usage Today
                </h2>
              </div>
              <p className="app-name text-3xl font-mono mb-3">{totalUsageHours}h {totalUsageMinutes}m</p>
            </div>
          </div>
        </div>
        


        {/* Development Testing Component */}
        {process.env.NODE_ENV === 'development' && (
          <div className="app-container p-6 md:p-8">
            <h2 className="text-xl font-semibold text-white mb-4">Development Tools</h2>
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
