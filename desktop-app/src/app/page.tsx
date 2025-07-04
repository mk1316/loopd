'use client';

import { useMemo, useEffect } from 'react';
import { useAppTracking } from '@/hooks/useAppTracking';
import { 
  CurrentAppDisplay, 
  ProtectedRoute
} from '@/components';
import { APP_CONSTANTS } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function Dashboard() {
  const {
    sessions,
    currentApp,
    lastUpdate,
    fetchSessions,
  } = useAppTracking();

  // Format time with seconds, omitting zero segments
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);
    return parts.join(' ');
  };

  // Calculate today's usage data
  const { totalUsageSeconds, todayUsageByApp } = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    
    const todaySessions = sessions.filter(session => {
      const sessionDate = new Date(session.start_time);
      return sessionDate >= todayStart && sessionDate < tomorrowStart;
    });

    const totalUsageSeconds = todaySessions.reduce((sum, session) => sum + (session.duration_sec || 0), 0);
    
    // Group by app and calculate usage
    const appUsage: Record<string, number> = {};
    todaySessions.forEach(session => {
      const appName = session.app_name;
      const duration = session.duration_sec || 0;
      appUsage[appName] = (appUsage[appName] || 0) + duration;
    });

    // Convert to array and sort by usage (descending)
    const todayUsageByApp = Object.entries(appUsage)
      .map(([appName, totalSeconds]) => ({
        appName,
        totalSeconds,
        formattedTime: formatTime(totalSeconds),
        percentage: totalUsageSeconds > 0 ? (totalSeconds / totalUsageSeconds) * 100 : 0
      }))
      .sort((a, b) => b.totalSeconds - a.totalSeconds);

    return { totalUsageSeconds, todayUsageByApp };
  }, [sessions]);

  const totalUsageHours = Math.floor(totalUsageSeconds / 3600);
  const totalUsageMinutes = Math.floor((totalUsageSeconds % 3600) / 60);

  // Refresh sessions every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchSessions, 60000);
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
          </div>
          
          {/* Usage Overview Header */}
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

        {/* Today's Usage by App Section */}
        <div className="app-container p-6 md:p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Today&apos;s Usage by App</h2>
            <Badge variant="secondary" className="text-sm">
              {todayUsageByApp.length} apps used today
            </Badge>
          </div>
          
          {todayUsageByApp.length > 0 ? (
            <div className="usage-table-container">
              <div className="grid gap-4">
                {todayUsageByApp.map((app, index) => (
                  <Card key={app.appName} className="card-dark border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-700 text-white font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-bold text-lg">{app.appName}</h3>
                            <span className="px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-300 text-xs font-semibold ml-1">
                              {app.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-white">
                          {app.formattedTime}
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-4">
                        <div className="w-full bg-slate-800/50 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                          <div 
                            className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-700 ease-out shadow-lg relative overflow-hidden"
                            style={{ width: `${Math.min(app.percentage, 100)}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card className="card-dark border-slate-700">
              <CardContent className="p-8 text-center">
                <div className="text-slate-400 mb-2">
                  <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-white font-medium mb-2">No usage data for today</h3>
                <p className="text-slate-400 text-sm">
                  Start using your applications to see usage tracking in action.
                </p>
              </CardContent>
            </Card>
          )}
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
