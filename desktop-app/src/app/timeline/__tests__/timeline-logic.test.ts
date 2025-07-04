import { describe, it, expect } from 'vitest';

// Mock session data for testing
const mockSessions = [
  {
    id: '1',
    device_id: 'test-device',
    user_id: null,
    app_name: 'VS Code',
    window_title: 'test.ts',
    start_time: '2024-01-01T09:30:00Z', // 9:30 AM
    end_time: '2024-01-01T11:15:00Z',   // 11:15 AM (spans 2 hours)
    duration_sec: 6300, // 105 minutes
    created_at: '2024-01-01T09:30:00Z'
  },
  {
    id: '2',
    device_id: 'test-device',
    user_id: null,
    app_name: 'Chrome',
    window_title: 'Google',
    start_time: '2024-01-01T10:00:00Z', // 10:00 AM
    end_time: '2024-01-01T10:45:00Z',   // 10:45 AM (within same hour)
    duration_sec: 2700, // 45 minutes
    created_at: '2024-01-01T10:00:00Z'
  },
  {
    id: '3',
    device_id: 'test-device',
    user_id: null,
    app_name: 'Slack',
    window_title: 'Team Chat',
    start_time: '2024-01-01T23:30:00Z', // 11:30 PM
    end_time: '2024-01-02T00:30:00Z',   // 12:30 AM (spans midnight)
    duration_sec: 3600, // 60 minutes
    created_at: '2024-01-01T23:30:00Z'
  }
];

// Simplified version of the timeline logic for testing
function calculateTimelineData(sessions: any[]) {
  const timelineSlots: Record<string, { hour: number; apps: Record<string, any> }> = {};
  
  // Initialize timeline data for all 24 hours
  for (let hour = 0; hour < 24; hour++) {
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour < 12 ? 'AM' : 'PM';
    const hourKey = `${displayHour}:00 ${ampm}`;
    timelineSlots[hourKey] = { hour, apps: {} };
  }

  // Process each session and distribute its duration across hours
  sessions.forEach(session => {
    const startTime = new Date(session.start_time);
    const endTime = new Date(session.end_time);
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
        };
      }
      timelineSlots[hourKey].apps[session.app_name].duration += minutes;
      current = segmentEnd;
    }
  });

  // Validate and cap durations to ensure no hour exceeds 60 minutes
  Object.values(timelineSlots).forEach(slot => {
    const totalMinutes = Object.values(slot.apps).reduce((sum: number, app: any) => sum + app.duration, 0);
    if (totalMinutes > 60) {
      // Scale down all app durations proportionally to fit within 60 minutes
      const scaleFactor = 60 / totalMinutes;
      Object.values(slot.apps).forEach((app: any) => {
        app.duration = Math.round(app.duration * scaleFactor);
      });
    }
  });

  return timelineSlots;
}

describe('Timeline Logic', () => {
  it('should distribute session duration across multiple hours correctly (local time)', () => {
    const timelineData = calculateTimelineData(mockSessions);
    // Find the local hour keys for the test sessions
    const start = new Date(mockSessions[0].start_time);
    const end = new Date(mockSessions[0].end_time);
    
    // Convert to 12-hour format
    const getDisplayHour = (hour: number) => hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const getAMPM = (hour: number) => hour < 12 ? 'AM' : 'PM';
    
    const hour1 = `${getDisplayHour(start.getHours())}:00 ${getAMPM(start.getHours())}`;
    const hour2 = `${getDisplayHour((start.getHours() + 1) % 24)}:00 ${getAMPM((start.getHours() + 1) % 24)}`;
    const hour3 = `${getDisplayHour((start.getHours() + 2) % 24)}:00 ${getAMPM((start.getHours() + 2) % 24)}`;
    
    // Check first hour (VS Code should have 30 minutes)
    expect(timelineData[hour1].apps['VS Code'].duration).toBe(30);
    // Check second hour (VS Code and Chrome overlap, so durations are scaled down)
    expect(timelineData[hour2].apps['VS Code'].duration).toBe(34);
    expect(timelineData[hour2].apps['Chrome'].duration).toBe(26);
    // Check third hour (VS Code should have 15 minutes)
    expect(timelineData[hour3].apps['VS Code'].duration).toBe(15);
  });

  it('should handle sessions spanning midnight correctly (local time)', () => {
    const timelineData = calculateTimelineData(mockSessions);
    // Find the local hour keys for the midnight session
    const start = new Date(mockSessions[2].start_time);
    
    // Convert to 12-hour format
    const getDisplayHour = (hour: number) => hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const getAMPM = (hour: number) => hour < 12 ? 'AM' : 'PM';
    
    const hourA = `${getDisplayHour(start.getHours())}:00 ${getAMPM(start.getHours())}`;
    const hourB = `${getDisplayHour((start.getHours() + 1) % 24)}:00 ${getAMPM((start.getHours() + 1) % 24)}`;
    expect(timelineData[hourA].apps['Slack'].duration).toBe(30);
    expect(timelineData[hourB].apps['Slack'].duration).toBe(30);
  });

  it('should ensure no hour exceeds 60 minutes total', () => {
    const timelineData = calculateTimelineData(mockSessions);
    Object.values(timelineData).forEach(slot => {
      const totalMinutes = Object.values(slot.apps).reduce((sum: number, app: any) => sum + app.duration, 0);
      expect(totalMinutes).toBeLessThanOrEqual(60);
    });
  });

  it('should handle overlapping sessions in the same hour (local time)', () => {
    // Create sessions that overlap in the 10:00 AM hour
    const overlappingSessions = [
      {
        id: '1',
        device_id: 'test-device',
        user_id: null,
        app_name: 'VS Code',
        window_title: 'test.ts',
        start_time: '2024-01-01T10:00:00Z',
        end_time: '2024-01-01T11:00:00Z',
        duration_sec: 3600,
        created_at: '2024-01-01T10:00:00Z'
      },
      {
        id: '2',
        device_id: 'test-device',
        user_id: null,
        app_name: 'Chrome',
        window_title: 'Google',
        start_time: '2024-01-01T10:00:00Z',
        end_time: '2024-01-01T10:45:00Z',
        duration_sec: 2700,
        created_at: '2024-01-01T10:00:00Z'
      }
    ];
    const timelineData = calculateTimelineData(overlappingSessions);
    const start = new Date(overlappingSessions[0].start_time);
    
    // Convert to 12-hour format
    const getDisplayHour = (hour: number) => hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const getAMPM = (hour: number) => hour < 12 ? 'AM' : 'PM';
    
    const hourKey = `${getDisplayHour(start.getHours())}:00 ${getAMPM(start.getHours())}`;
    const totalMinutes = Object.values(timelineData[hourKey].apps).reduce((sum: number, app: any) => sum + app.duration, 0);
    expect(totalMinutes).toBeLessThanOrEqual(60);
    expect(timelineData[hourKey].apps['VS Code']).toBeDefined();
    expect(timelineData[hourKey].apps['Chrome']).toBeDefined();
  });
}); 