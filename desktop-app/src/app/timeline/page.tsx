'use client';

import { useState, useMemo } from 'react';
import { useAppTracking } from '@/hooks/useAppTracking';
import { ProtectedRoute, UserProfile, ClearDataButton, Navigation, TimelineView, DaySelector, SyncStatus } from '@/components';

function TimelinePage() {
  const {
    sessions,
    isClearing,
    clearAllData,
  } = useAppTracking();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Filter sessions based on selected date
  const filteredSessions = useMemo(() => {
    if (!selectedDate) {
      return sessions;
    }
    
    return sessions.filter(session => 
      new Date(session.start_time).toDateString() === selectedDate
    );
  }, [sessions, selectedDate]);

  const handleDateSelect = (date: string | null) => {
    setSelectedDate(date);
  };

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
            <div className="flex items-center gap-4">
              <SyncStatus />
              <UserProfile />
              <ClearDataButton onClear={clearAllData} isClearing={isClearing} />
            </div>
          </div>
          
          <Navigation />
        </div>
        
        <div className="app-container p-6 md:p-8">
          <DaySelector 
            sessions={sessions}
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />
          <TimelineView sessions={filteredSessions} selectedDate={selectedDate} />
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