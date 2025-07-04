'use client';

import { useState, useMemo } from 'react';
import { Clock, Smartphone, Monitor, Filter, Search } from 'lucide-react';
import { useAppTracking } from '@/hooks/useAppTracking';
import { ProtectedRoute } from '@/components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';

interface TimelineApp {
  name: string;
  duration: number; // in minutes
  category: string;
  device: string;
  color: string;
  windowTitle?: string;
}

function TimelinePage() {
  const {
    sessions,
  } = useAppTracking();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDevice, setSelectedDevice] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Categories and devices for filtering
  const categories = [
    "All",
    "Work Tools",
    "Social Media",
    "Entertainment",
    "Communication",
    "Health & Fitness",
    "Utilities",
  ];
  const devices = ["All", "Mobile", "Desktop"];

  // Filter sessions by selected date
  const filteredSessions = useMemo(() => {
    if (!selectedDate) return [];
    return sessions.filter(session => {
      const sessionDate = new Date(session.start_time);
      return (
        sessionDate.getFullYear() === selectedDate.getFullYear() &&
        sessionDate.getMonth() === selectedDate.getMonth() &&
        sessionDate.getDate() === selectedDate.getDate()
      );
    });
  }, [sessions, selectedDate]);

  // Group sessions by hour, then by app, summing durations
  // FIXED: Sessions that span multiple hours are now properly distributed across all affected hours
  // This prevents any hour from showing more than 60 minutes of total usage time
  const timelineData = useMemo(() => {
    if (!filteredSessions.length) return [];
    
    // Initialize timeline data for all 24 hours
    const timelineSlots: Record<string, { hour: number; apps: Record<string, TimelineApp> }> = {};
    for (let hour = 0; hour < 24; hour++) {
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour < 12 ? 'AM' : 'PM';
      const hourKey = `${displayHour}:00 ${ampm}`;
      timelineSlots[hourKey] = { hour, apps: {} };
    }

    // Process each session and distribute its duration across hours
    filteredSessions.forEach(session => {
      const startTime = new Date(session.start_time);
      const endTime = session.end_time ? new Date(session.end_time) : new Date();
      // Determine category and device (mock for now)
      const category = "Work Tools";
      const device = "Desktop";
      // Generate color based on app name
      const colors = [
        "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-red-500", 
        "bg-yellow-500", "bg-pink-500", "bg-indigo-500", "bg-orange-500"
      ];
      const colorIndex = session.app_name.charCodeAt(0) % colors.length;

      let current = new Date(startTime);
      while (current < endTime) {
        const hour = current.getHours();
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const ampm = hour < 12 ? 'AM' : 'PM';
        const hourKey = `${displayHour}:00 ${ampm}`;
        const nextHour = new Date(current);
        nextHour.setHours(hour + 1, 0, 0, 0);
        const segmentEnd = nextHour < endTime ? nextHour : endTime;
        const minutes = Math.ceil((segmentEnd.getTime() - current.getTime()) / (1000 * 60));
        if (!timelineSlots[hourKey].apps[session.app_name]) {
          timelineSlots[hourKey].apps[session.app_name] = {
            name: session.app_name,
            duration: 0,
            category,
            device,
            color: colors[colorIndex],
            windowTitle: session.window_title,
          };
        }
        timelineSlots[hourKey].apps[session.app_name].duration += minutes;
        current = segmentEnd;
      }
    });

    // Validate and cap durations to ensure no hour exceeds 60 minutes
    Object.values(timelineSlots).forEach(slot => {
      const total = Object.values(slot.apps).reduce((sum, app) => sum + app.duration, 0);
      if (total > 60) {
        // Scale down all app durations proportionally to fit within 60 minutes
        const scaleFactor = 60 / total;
        Object.values(slot.apps).forEach(app => {
          app.duration = Math.round(app.duration * scaleFactor);
        });
      }
    });

    // Convert to array, filter out empty hours, and sort by hour
    return Object.entries(timelineSlots)
      .map(([time, { hour, apps }]) => ({
        time,
        hour,
        apps: Object.values(apps),
      }))
      .filter(slot => slot.apps.length > 0) // Only include hours with activity
      .sort((a, b) => a.hour - b.hour);
  }, [filteredSessions]);

  // Filter timeline data by category, device, search
  const filteredTimelineData = useMemo(() => {
    return timelineData
      .map((timeSlot) => ({
        ...timeSlot,
        apps: timeSlot.apps.filter((app: TimelineApp) => {
          const matchesCategory = selectedCategory === "All" || app.category === selectedCategory;
          const matchesDevice = selectedDevice === "All" || app.device === selectedDevice;
          const matchesSearch = searchQuery === "" || app.name.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesCategory && matchesDevice && matchesSearch;
        }),
      }))
      .filter((timeSlot) => timeSlot.apps.length > 0);
  }, [timelineData, selectedCategory, selectedDevice, searchQuery]);

  const getTotalTimeForHour = (apps: TimelineApp[]) => {
    return apps.reduce((total, app) => total + app.duration, 0);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getTimeSlotIntensity = (totalMinutes: number) => {
    // With the corrected time distribution, totalMinutes should never exceed 60
    // High: 45+ minutes (75%+ of the hour)
    // Medium: 20-44 minutes (33-75% of the hour)  
    // Low: <20 minutes (<33% of the hour)
    if (totalMinutes >= 45) return "high";
    if (totalMinutes >= 20) return "medium";
    return "low";
  };

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!filteredTimelineData.length) return null;
    const allApps = filteredTimelineData.flatMap(slot => slot.apps);
    // Most active hour
    const mostActiveHour = filteredTimelineData.reduce((max, slot) => {
      const totalMinutes = getTotalTimeForHour(slot.apps);
      return totalMinutes > getTotalTimeForHour(max.apps) ? slot : max;
    });
    // Peak category
    const categoryTotals = allApps.reduce((acc, app) => {
      acc[app.category] = (acc[app.category] || 0) + app.duration;
      return acc;
    }, {} as Record<string, number>);
    const peakCategory = Object.entries(categoryTotals).reduce((max, [category, minutes]) => 
      minutes > max.minutes ? { category, minutes } : max, 
      { category: "None", minutes: 0 }
    );
    // Device split
    const deviceTotals = allApps.reduce((acc, app) => {
      acc[app.device] = (acc[app.device] || 0) + app.duration;
      return acc;
    }, {} as Record<string, number>);
    const totalDeviceMinutes = Object.values(deviceTotals).reduce((sum, minutes) => sum + minutes, 0);
    const deviceSplit = Object.entries(deviceTotals).map(([device, minutes]) => ({
      device,
      percentage: Math.round((minutes / totalDeviceMinutes) * 100)
    }));
    return {
      mostActiveHour: mostActiveHour.time,
      mostActiveMinutes: getTotalTimeForHour(mostActiveHour.apps),
      peakCategory: peakCategory.category,
      peakCategoryMinutes: peakCategory.minutes,
      deviceSplit
    };
  }, [filteredTimelineData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="app-container p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                Usage Timeline
              </h1>
              <p className="text-lg md:text-xl text-slate-300 font-medium">
                View your app usage history chronologically
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Daily Timeline</h2>
              <p className="text-gray-400">Track your app usage throughout the day</p>
            </div>
            <div className="flex items-center gap-4">
              <DatePicker date={selectedDate} setDate={setSelectedDate} />
            </div>
          </div>
          {/* Filters */}
          <Card className="card-dark">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Search Apps</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search for apps..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="bg-white/5 border-white/20 text-white rounded-md px-3 py-2 w-full"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Device</label>
                  <select
                    value={selectedDevice}
                    onChange={e => setSelectedDevice(e.target.value)}
                    className="bg-white/5 border-white/20 text-white rounded-md px-3 py-2 w-full"
                  >
                    {devices.map((device) => (
                      <option key={device} value={device}>{device}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Timeline */}
          <Card className="card-dark">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline View
              </CardTitle>
              <CardDescription className="text-gray-400">Your app usage throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTimelineData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-slate-400 text-lg mb-4">
                    No sessions found for the selected filters
                  </div>
                  <p className="text-slate-500">
                    Try adjusting your filters or clear them to see all sessions.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredTimelineData.map((timeSlot, index) => {
                    const totalMinutes = getTotalTimeForHour(timeSlot.apps);
                    const intensity = getTimeSlotIntensity(totalMinutes);
                    return (
                      <div key={timeSlot.time} className="relative">
                        {/* Timeline Line */}
                        {index !== filteredTimelineData.length - 1 && (
                          <div className="absolute left-6 top-12 w-0.5 h-16 bg-gradient-to-b from-indigo-500/50 to-transparent" />
                        )}
                        {/* Time Marker */}
                        <div className="flex items-start gap-6">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-3 h-3 rounded-full border-2 ${
                                intensity === "high"
                                  ? "bg-red-500 border-red-400"
                                  : intensity === "medium"
                                    ? "bg-yellow-500 border-yellow-400"
                                    : "bg-green-500 border-green-400"
                              }`}
                            />
                            <span className="text-sm font-medium text-gray-400 mt-2 min-w-[60px] text-center">
                              {timeSlot.time}
                            </span>
                          </div>
                          {/* Apps for this time slot */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-sm text-gray-400">Total: {formatDuration(totalMinutes)}</span>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  intensity === "high"
                                    ? "border-red-400/50 text-red-400"
                                    : intensity === "medium"
                                      ? "border-yellow-400/50 text-yellow-400"
                                      : "border-green-400/50 text-green-400"
                                }`}
                              >
                                {intensity === "high"
                                  ? "High Usage"
                                  : intensity === "medium"
                                    ? "Medium Usage"
                                    : "Light Usage"}
                              </Badge>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                              {[...timeSlot.apps]
                                .sort((a, b) => b.duration - a.duration)
                                .slice(0, 3)
                                .map((app: TimelineApp, appIndex: number) => (
                                  <div
                                    key={`${app.name}-${appIndex}`}
                                    className="flex items-center gap-3 p-3 rounded-lg glass-effect hover:bg-white/10 transition-all duration-200 cursor-pointer group"
                                  >
                                    <div
                                      className={`w-8 h-8 rounded-lg ${app.color} flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform`}
                                    >
                                      {app.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-white text-sm truncate group-hover:text-gray-200 transition-colors">
                                        {app.name}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-400">{formatDuration(app.duration)}</span>
                                        <span className="text-xs text-gray-500">•</span>
                                        <div className="flex items-center gap-1">
                                          {app.device === "Mobile" ? (
                                            <Smartphone className="h-3 w-3 text-gray-500" />
                                          ) : (
                                            <Monitor className="h-3 w-3 text-gray-500" />
                                          )}
                                          <span className="text-xs text-gray-500">{app.device}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs border-white/20 bg-white/5 text-gray-400">
                                      {app.category}
                                    </Badge>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          {/* Summary Stats */}
          {summaryStats && (
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="card-dark">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Most Active Hour</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{summaryStats.mostActiveHour}</div>
                  <p className="text-sm text-gray-400">{formatDuration(summaryStats.mostActiveMinutes)} of usage</p>
                </CardContent>
              </Card>
              <Card className="card-dark">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Peak Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{summaryStats.peakCategory}</div>
                  <p className="text-sm text-gray-400">{formatDuration(summaryStats.peakCategoryMinutes)} total usage</p>
                </CardContent>
              </Card>
              <Card className="card-dark">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Device Split</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {summaryStats.deviceSplit.map(({ device, percentage }) => (
                      <div key={device} className="flex justify-between">
                        <span className="text-gray-400">{device}</span>
                        <span className="text-white">{percentage}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Timeline() {
  return (
    <ProtectedRoute>
      <TimelinePage />
    </ProtectedRoute>
  );
} 