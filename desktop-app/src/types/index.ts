// Usage data types
export interface UsageSummary {
  day: string;
  app_name: string;
  total_seconds: number;
}

// Session data types
export interface Session {
  id: string;
  device_id: string;
  user_id: string | null;
  app_name: string;
  window_title: string;
  start_time: string;
  end_time: string | null;
  duration_sec: number | null;
  created_at: string;
}

// App state types
export interface AppState {
  usage: UsageSummary[];
  sessions: Session[];
  currentApp: string;
  lastUpdate: string;
  deviceId: string;
  isClearing: boolean;
}

// App actions types
export interface AppActions {
  fetchUsage: () => Promise<void>;
  fetchSessions: () => Promise<void>;
  fetchCurrentApp: () => Promise<void>;
  fetchDeviceId: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

// Component prop types
export interface CurrentAppDisplayProps {
  currentApp: string;
  lastUpdate: string;
}

export interface DeviceIdDisplayProps {
  deviceId: string;
}

export interface UsageDataDisplayProps {
  usage: UsageSummary[];
}

export interface TimelineViewProps {
  sessions: Session[];
}

export interface TableViewProps {
  sessions: Session[];
}

export interface ClearDataButtonProps {
  onClear: () => Promise<void>;
  isClearing: boolean;
} 