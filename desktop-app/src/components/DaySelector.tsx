'use client';

import { useState, useEffect } from 'react';
import { Session } from '@/types';

interface DaySelectorProps {
  sessions: Session[];
  onDateSelect: (selectedDate: string | null) => void;
  selectedDate: string | null;
}

export function DaySelector({ sessions, onDateSelect, selectedDate }: DaySelectorProps) {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [dateInputValue, setDateInputValue] = useState<string>('');

  useEffect(() => {
    // Extract unique dates from sessions
    const dates = [...new Set(
      sessions.map(session => new Date(session.start_time).toDateString())
    )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    setAvailableDates(dates);
  }, [sessions]);

  useEffect(() => {
    // Update date input value when selectedDate changes
    if (selectedDate) {
      const date = new Date(selectedDate);
      setDateInputValue(date.toISOString().split('T')[0]); // Format as YYYY-MM-DD
    } else {
      setDateInputValue('');
    }
  }, [selectedDate]);

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
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDateInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setDateInputValue(value);
    
    if (value) {
      const selectedDateString = new Date(value).toDateString();
      onDateSelect(selectedDateString);
    } else {
      onDateSelect(null);
    }
  };

  const clearFilter = () => {
    onDateSelect(null);
    setDateInputValue('');
  };

  if (availableDates.length === 0) {
    return null;
  }

  const selectedDateSessions = selectedDate 
    ? sessions.filter(s => new Date(s.start_time).toDateString() === selectedDate)
    : [];

  return (
    <div className="mb-6 space-y-4">
      {/* Date Selection Header */}
      <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
          <h3 className="text-lg font-medium text-white">Timeline for:</h3>
          {selectedDate ? (
            <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
              <span className="text-lg sm:text-xl font-semibold text-blue-400 break-words">
                {formatFullDate(selectedDate)}
              </span>
              <button
                onClick={clearFilter}
                className="text-sm text-slate-400 hover:text-slate-300 transition-colors self-start sm:self-auto"
              >
                (Clear)
              </button>
            </div>
          ) : (
            <span className="text-lg sm:text-xl font-semibold text-slate-300">Select a date</span>
          )}
        </div>
      </div>

      {/* Date Picker */}
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
        <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
          <label htmlFor="date-picker" className="text-sm font-medium text-slate-300 whitespace-nowrap">
            Select Date:
          </label>
          <input
            id="date-picker"
            type="date"
            value={dateInputValue}
            onChange={handleDateInputChange}
            className="w-full sm:w-auto px-3 py-2 rounded-lg text-sm font-medium bg-slate-700 text-white border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200"
            min={availableDates.length > 0 ? new Date(availableDates[availableDates.length - 1]).toISOString().split('T')[0] : undefined}
            max={availableDates.length > 0 ? new Date(availableDates[0]).toISOString().split('T')[0] : undefined}
          />
        </div>
      </div>

      {/* Quick Date Selection */}
      <div className="flex flex-wrap gap-2">
        {availableDates.slice(0, 7).map((date) => (
          <button
            key={date}
            onClick={() => {
              onDateSelect(date);
              setDateInputValue(new Date(date).toISOString().split('T')[0]);
            }}
            className={`
              flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap
              ${selectedDate === date 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
              }
            `}
          >
            {formatDate(date)}
          </button>
        ))}
        
        {availableDates.length > 7 && (
          <div className="relative group flex-shrink-0">
            <button className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-all duration-200 whitespace-nowrap">
              More...
            </button>
            
            <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 max-h-60 overflow-y-auto min-w-max">
              {availableDates.slice(7).map((date) => (
                <button
                  key={date}
                  onClick={() => {
                    onDateSelect(date);
                    setDateInputValue(new Date(date).toISOString().split('T')[0]);
                  }}
                  className={`
                    block w-full px-3 py-2 text-left text-sm hover:bg-slate-700 transition-colors whitespace-nowrap
                    ${selectedDate === date ? 'bg-blue-600 text-white' : 'text-slate-300'}
                  `}
                >
                  {formatDate(date)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Session Count and Info */}
      {selectedDate && (
        <div className="p-3 bg-slate-800 rounded-lg border border-slate-600">
          <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div className="text-sm text-slate-300">
              <span className="font-medium">{selectedDateSessions.length}</span> session{selectedDateSessions.length !== 1 ? 's' : ''} on {formatDate(selectedDate)}
            </div>
            
            {selectedDateSessions.length > 0 && (
              <div className="text-xs text-slate-400 break-words">
                {(() => {
                  const firstSession = selectedDateSessions[selectedDateSessions.length - 1]; // Earliest session
                  const lastSession = selectedDateSessions[0]; // Latest session
                  const firstTime = new Date(firstSession.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                  const lastTime = new Date(lastSession.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                  return `Activity: ${firstTime} - ${lastTime}`;
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 