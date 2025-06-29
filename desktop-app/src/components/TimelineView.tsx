'use client';

import { Session } from '@/types';
import { formatTime } from '@/lib/timeUtils';
import React from 'react';

interface TimelineViewProps {
  sessions: Session[];
  selectedDate?: string | null;
}

export function TimelineView({ sessions, selectedDate }: TimelineViewProps) {
  // Sort sessions by start time (most recent first)
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  // Group sessions by day (for multi-day view) or show single day timeline
  const groupedSessions = selectedDate 
    ? { [selectedDate]: sortedSessions } // Single day view
    : sortedSessions.reduce((acc, session) => {
        const day = new Date(session.start_time).toDateString();
        if (!acc[day]) {
          acc[day] = [];
        }
        acc[day].push(session);
        return acc;
      }, {} as Record<string, Session[]>);

  // Sort days in descending order (most recent first)
  const sortedDays = Object.keys(groupedSessions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Helper to format duration nicely
  const formatDuration = (seconds: number) => {
    if (!seconds || seconds < 1) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m > 0 ? m + 'm ' : ''}${s}s`;
  };

  if (sessions.length === 0) {
    if (selectedDate) {
      return (
        <div className="text-center py-12">
          <div className="text-slate-400 text-lg mb-4">
            No sessions found for the selected date
          </div>
          <p className="text-slate-500">
            Try selecting a different date or clear the filter to see all sessions.
          </p>
        </div>
      );
    }
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 text-lg mb-4">
          No session data available
        </div>
        <p className="text-slate-500">
          Start using applications to see your timeline here.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500/60 to-fuchsia-500/40 rounded-full pointer-events-none" style={{ zIndex: 0 }} />
      <div className="timeline-list space-y-10 pl-10">
        {sortedDays.map((day) => (
          <div key={day} className="mb-8">
            {!selectedDate && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-1">{formatDate(day)}</h3>
                <div className="text-xs text-slate-400">{groupedSessions[day].length} session{groupedSessions[day].length !== 1 ? 's' : ''}</div>
              </div>
            )}
            <div className="flex flex-col gap-6">
              {groupedSessions[day]
                .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                .map((session, idx) => {
                  const startTime = new Date(session.start_time);
                  const endTime = session.end_time ? new Date(session.end_time) : null;
                  const duration = endTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : null;
                  return (
                    <div key={session.id} className="relative flex items-start group">
                      {/* Timeline dot */}
                      <div className="absolute -left-6 top-4 w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-fuchsia-500 border-2 border-slate-900 shadow-md" style={{ zIndex: 2 }} />
                      {/* Card */}
                      <div className="flex-1 bg-slate-800/80 rounded-xl shadow-lg p-5 border border-slate-700 hover:border-blue-500 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                          <span className="text-base sm:text-lg font-semibold text-white tracking-tight">
                            {session.app_name}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            {endTime ? (
                              <>
                                {' '}– {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </>
                            ) : (
                              <>
                                {' '}– <span className="text-green-400">Active</span>
                              </>
                            )}
                          </span>
                        </div>
                        {session.window_title && (
                          <div className="text-sm text-slate-300 mb-1 truncate">
                            {session.window_title}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-blue-400 font-mono">
                            Duration: {duration !== null ? formatDuration(duration) : 'Active'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 