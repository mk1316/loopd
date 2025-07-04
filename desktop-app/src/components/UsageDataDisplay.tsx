import { useState, useMemo } from 'react';
import { UsageDataDisplayProps } from '@/types';
import { APP_CONSTANTS } from '@/lib/constants';
import { formatTime } from '@/lib/timeUtils';

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'total';

interface TimeRangeOption {
  value: TimeRange;
  label: string;
  description: string;
}

const timeRangeOptions: TimeRangeOption[] = [
  { value: 'daily', label: 'Daily', description: 'Today\'s usage' },
  { value: 'weekly', label: 'Weekly', description: 'Last 7 days' },
  { value: 'monthly', label: 'Monthly', description: 'Last 30 days' },
  { value: 'total', label: 'Total', description: 'All time' },
];

export function UsageDataDisplay({ usage, sessions }: UsageDataDisplayProps & { sessions?: any[] }) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('daily');
  // Add state for selected date/week/month
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 10); // yyyy-mm-dd
  });
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const week = getWeekNumber(now);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 7); // yyyy-mm
  });

  // Helper to get ISO week number
  function getWeekNumber(date: Date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d as any) - (yearStart as any)) / 86400000 + 1) / 7);
  }

  // Aggregate usage data based on selected time range and picker
  const aggregatedUsage = useMemo(() => {
    if (!sessions) return usage; // Fallback to original usage if no sessions provided

    let filteredSessions = sessions;

    switch (selectedTimeRange) {
      case 'daily': {
        const day = new Date(selectedDate);
        const start = new Date(day.getFullYear(), day.getMonth(), day.getDate());
        const end = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
        filteredSessions = sessions.filter(session => {
          const sessionDate = new Date(session.start_time);
          return sessionDate >= start && sessionDate < end;
        });
        break;
      }
      case 'weekly': {
        // selectedWeek is in format yyyy-Www
        const [yearStr, weekStr] = selectedWeek.split('-W');
        const year = parseInt(yearStr, 10);
        const week = parseInt(weekStr, 10);
        // Get first day of week (Monday)
        const firstDayOfYear = new Date(Date.UTC(year, 0, 1));
        const daysOffset = ((week - 1) * 7) + (firstDayOfYear.getUTCDay() <= 4 ? 1 : 8 - firstDayOfYear.getUTCDay());
        const start = new Date(Date.UTC(year, 0, daysOffset));
        const end = new Date(Date.UTC(year, 0, daysOffset + 7));
        filteredSessions = sessions.filter(session => {
          const sessionDate = new Date(session.start_time);
          return sessionDate >= start && sessionDate < end;
        });
        break;
      }
      case 'monthly': {
        // selectedMonth is in format yyyy-mm
        const [yearStr, monthStr] = selectedMonth.split('-');
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10) - 1;
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 1);
        filteredSessions = sessions.filter(session => {
          const sessionDate = new Date(session.start_time);
          return sessionDate >= start && sessionDate < end;
        });
        break;
      }
      case 'total':
        // Use all sessions
        break;
    }

    // Aggregate by app_name
    const usageMap = new Map<string, { app_name: string; total_seconds: number }>();
    filteredSessions.forEach(session => {
      if (!session.duration_sec) return;
      const appName = session.app_name;
      if (!usageMap.has(appName)) {
        usageMap.set(appName, { app_name: appName, total_seconds: 0 });
      }
      usageMap.get(appName)!.total_seconds += session.duration_sec;
    });

    // Convert to array and sort by total_seconds
    return Array.from(usageMap.values()).sort((a, b) => b.total_seconds - a.total_seconds);
  }, [sessions, selectedTimeRange, usage, selectedDate, selectedWeek, selectedMonth]);

  // Calculate total usage for the selected range
  const totalUsageSeconds = aggregatedUsage.reduce((sum, u) => sum + u.total_seconds, 0);
  const maxUsageSeconds = Math.max(...aggregatedUsage.map(u => u.total_seconds), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-indigo-400 animate-glow"></div>
          <h2 className="text-2xl font-semibold text-indigo-300">
            {APP_CONSTANTS.USAGE_DATA}
          </h2>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Time Range:</span>
          <div className="flex bg-slate-800 rounded-lg p-1">
            {timeRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedTimeRange(option.value)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                  selectedTimeRange === option.value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700'
                }`}
                title={option.description}
              >
                {option.label}
              </button>
            ))}
          </div>
          {/* Date/Week/Month Picker */}
          {selectedTimeRange === 'daily' && (
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="ml-2 bg-slate-800 text-slate-200 rounded px-2 py-1 border border-slate-700"
              max={new Date().toISOString().slice(0, 10)}
            />
          )}
          {selectedTimeRange === 'weekly' && (
            <input
              type="week"
              value={selectedWeek}
              onChange={e => setSelectedWeek(e.target.value)}
              className="ml-2 bg-slate-800 text-slate-200 rounded px-2 py-1 border border-slate-700"
              max={(() => {
                const now = new Date();
                const year = now.getFullYear();
                const week = getWeekNumber(now);
                return `${year}-W${week.toString().padStart(2, '0')}`;
              })()}
            />
          )}
          {selectedTimeRange === 'monthly' && (
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="ml-2 bg-slate-800 text-slate-200 rounded px-2 py-1 border border-slate-700"
              max={new Date().toISOString().slice(0, 7)}
            />
          )}
        </div>
      </div>

      {/* Total Usage Summary */}
      <div className="usage-card p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Total Usage ({timeRangeOptions.find(opt => opt.value === selectedTimeRange)?.label})
            </h3>
            <p className="text-sm text-slate-400">
              {timeRangeOptions.find(opt => opt.value === selectedTimeRange)?.description}
            </p>
          </div>
          <div className="text-right">
            <p className="time-display text-2xl font-mono">{formatTime(totalUsageSeconds)}</p>
            <p className="text-sm text-slate-400">
              {aggregatedUsage.length} app{aggregatedUsage.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
      
      {aggregatedUsage.length === 0 ? (
        <div className="usage-card p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-slate-300 text-lg mb-2">{APP_CONSTANTS.NO_USAGE_DATA}</p>
          <p className="text-slate-400 text-sm">
            {APP_CONSTANTS.NO_USAGE_DATA_HINT}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {aggregatedUsage.map((summary) => (
            <div 
              key={summary.app_name}
              className="usage-card p-6 hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                  <span className="app-name font-semibold">{summary.app_name}</span>
                </div>
                <span className="time-display font-mono text-lg">
                  {formatTime(summary.total_seconds)}
                </span>
              </div>
              
              <div className="w-full bg-slate-700/50 rounded-full h-2 mb-2">
                <div 
                  className="usage-bar h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min((summary.total_seconds / maxUsageSeconds) * 100, 100)}%` 
                  }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-slate-400">
                <span>
                  {Math.round((summary.total_seconds / totalUsageSeconds) * 100)}% of total
                </span>
                <span>
                  {Math.round((summary.total_seconds / maxUsageSeconds) * 100)}% of max
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 