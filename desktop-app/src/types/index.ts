

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

// Block rule types
export interface BlockRule {
  id: string;
  device_id: string;
  user_id: string | null;
  app_name: string;
  block_type: 'time' | 'usage';
  time_window_start: string | null;
  time_window_end: string | null;
  daily_limit_minutes: number | null;
  strictness: 'hard' | 'soft';
  enabled: boolean;
  synced: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlockOverride {
  id: string;
  device_id: string;
  user_id: string | null;
  rule_id: string;
  app_name: string;
  override_time: string;
  override_reason: string | null;
  created_at: string;
}

export interface BlockStatus {
  is_blocked: boolean;
  rule: BlockRule | null;
  reason: string;
  can_override: boolean;
}

// App state types
export interface AppState {
  sessions: Session[];
  currentApp: string;
  lastUpdate: string;
  deviceId: string;
  isClearing: boolean;
  blockRules: BlockRule[];
  currentBlockStatus: BlockStatus | null;
  isBlockingEnabled: boolean;
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