// Analytics utilities for processing usage data

export interface UsageStats {
  totalTime: number;
  appCount: number;
  mostUsedApp: string;
  mostUsedAppTime: number;
  averageSessionLength: number;
  totalSessions: number;
  productivityScore?: number;
}

export interface DailyStats {
  date: string;
  totalTime: number;
  appBreakdown: Record<string, number>;
  sessionCount: number;
  averageSessionLength: number;
}

export interface WeeklyStats {
  weekStart: string;
  totalTime: number;
  dailyAverages: Record<string, number>;
  mostProductiveDay: string;
  leastProductiveDay: string;
}

// Calculate usage statistics for a given time period
export const calculateUsageStats = (
  sessions: Array<{
    app_name: string;
    duration_seconds: number;
    start_time: string;
  }>
): UsageStats => {
  if (sessions.length === 0) {
    return {
      totalTime: 0,
      appCount: 0,
      mostUsedApp: '',
      mostUsedAppTime: 0,
      averageSessionLength: 0,
      totalSessions: 0,
    };
  }

  // Group by app and calculate totals
  const appUsage: Record<string, number> = {};
  let totalTime = 0;

  sessions.forEach(session => {
    const appName = session.app_name;
    const duration = session.duration_seconds;
    
    appUsage[appName] = (appUsage[appName] || 0) + duration;
    totalTime += duration;
  });

  // Find most used app
  const mostUsedApp = Object.entries(appUsage).reduce((a, b) => 
    appUsage[a[0]] > appUsage[b[0]] ? a : b
  )[0];

  const mostUsedAppTime = appUsage[mostUsedApp];
  const appCount = Object.keys(appUsage).length;
  const averageSessionLength = totalTime / sessions.length;

  // Calculate productivity score (simple heuristic)
  const productivityScore = calculateProductivityScore(appUsage, totalTime);

  return {
    totalTime,
    appCount,
    mostUsedApp,
    mostUsedAppTime,
    averageSessionLength,
    totalSessions: sessions.length,
    productivityScore,
  };
};

// Calculate daily statistics
export const calculateDailyStats = (
  sessions: Array<{
    app_name: string;
    duration_seconds: number;
    start_time: string;
  }>
): DailyStats[] => {
  const dailyGroups: Record<string, typeof sessions> = {};

  // Group sessions by date
  sessions.forEach(session => {
    const date = new Date(session.start_time).toISOString().split('T')[0];
    if (!dailyGroups[date]) {
      dailyGroups[date] = [];
    }
    dailyGroups[date].push(session);
  });

  // Calculate stats for each day
  return Object.entries(dailyGroups).map(([date, daySessions]) => {
    const appBreakdown: Record<string, number> = {};
    let totalTime = 0;

    daySessions.forEach(session => {
      const appName = session.app_name;
      const duration = session.duration_seconds;
      
      appBreakdown[appName] = (appBreakdown[appName] || 0) + duration;
      totalTime += duration;
    });

    return {
      date,
      totalTime,
      appBreakdown,
      sessionCount: daySessions.length,
      averageSessionLength: totalTime / daySessions.length,
    };
  }).sort((a, b) => a.date.localeCompare(b.date));
};

// Calculate weekly statistics
export const calculateWeeklyStats = (
  sessions: Array<{
    app_name: string;
    duration_seconds: number;
    start_time: string;
  }>
): WeeklyStats[] => {
  const dailyStats = calculateDailyStats(sessions);
  const weeklyGroups: Record<string, DailyStats[]> = {};

  // Group daily stats by week
  dailyStats.forEach(dayStat => {
    const weekStart = getWeekStart(dayStat.date);
    if (!weeklyGroups[weekStart]) {
      weeklyGroups[weekStart] = [];
    }
    weeklyGroups[weekStart].push(dayStat);
  });

  // Calculate weekly stats
  return Object.entries(weeklyGroups).map(([weekStart, weekDays]) => {
    const totalTime = weekDays.reduce((sum, day) => sum + day.totalTime, 0);
    const dailyAverages: Record<string, number> = {};

    // Calculate daily averages
    weekDays.forEach(day => {
      dailyAverages[day.date] = day.totalTime;
    });

    // Find most and least productive days
    const sortedDays = weekDays.sort((a, b) => b.totalTime - a.totalTime);
    const mostProductiveDay = sortedDays[0]?.date || '';
    const leastProductiveDay = sortedDays[sortedDays.length - 1]?.date || '';

    return {
      weekStart,
      totalTime,
      dailyAverages,
      mostProductiveDay,
      leastProductiveDay,
    };
  }).sort((a, b) => a.weekStart.localeCompare(b.weekStart));
};

// Helper function to get week start date
const getWeekStart = (dateString: string): string => {
  const date = new Date(dateString);
  const dayOfWeek = date.getDay();
  const diff = date.getDate() - dayOfWeek;
  const weekStart = new Date(date.setDate(diff));
  return weekStart.toISOString().split('T')[0];
};

// Calculate productivity score based on app usage patterns
const calculateProductivityScore = (
  appUsage: Record<string, number>,
  totalTime: number
): number => {
  // Define productivity categories (you can customize this)
  const productiveApps = [
    'code', 'editor', 'terminal', 'browser', 'slack', 'teams',
    'notion', 'obsidian', 'vscode', 'intellij', 'sublime'
  ];
  
  const distractingApps = [
    'youtube', 'netflix', 'facebook', 'instagram', 'twitter',
    'tiktok', 'reddit', 'discord', 'spotify', 'games'
  ];

  let productiveTime = 0;
  let distractingTime = 0;

  Object.entries(appUsage).forEach(([appName, time]) => {
    const lowerAppName = appName.toLowerCase();
    
    if (productiveApps.some(productive => lowerAppName.includes(productive))) {
      productiveTime += time;
    } else if (distractingApps.some(distracting => lowerAppName.includes(distracting))) {
      distractingTime += time;
    }
  });

  if (totalTime === 0) return 0;

  // Calculate score: (productive - distracting) / total * 100
  const score = ((productiveTime - distractingTime) / totalTime) * 100;
  return Math.max(0, Math.min(100, score + 50)); // Normalize to 0-100
};

// Format time for display
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Get time range for filtering
export const getTimeRange = (range: 'day' | 'week' | 'month'): { start: Date; end: Date } => {
  const now = new Date();
  const start = new Date(now);

  switch (range) {
    case 'day':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      break;
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
  }

  return { start, end: now };
}; 