// ============================================================
// ActivityWatch-compatible types
// ============================================================

/**
 * ActivityWatch Bucket - container for events from a specific watcher
 */
export interface AWBucket {
  id: string;
  name?: string;
  type: string; // e.g., "currentwindow", "afkstatus", "web.tab.current"
  client: string; // e.g., "aw-watcher-window", "loopd", "awatcher"
  hostname: string;
  created: string; // ISO8601 timestamp
  data?: Record<string, unknown>;
  last_updated?: string; // ISO8601 timestamp
}

/**
 * ActivityWatch Event - activity data with timestamp and duration
 */
export interface AWEvent {
  id?: number;
  bucket_id?: string;
  timestamp: string; // ISO8601 timestamp
  duration: number; // seconds
  data: Record<string, unknown>;
}

/**
 * Window event data
 */
export interface AWWindowEventData {
  app: string;
  title: string;
}

/**
 * AFK event data
 */
export interface AWAfkEventData {
  status: 'afk' | 'not-afk';
}

/**
 * Web tab event data
 */
export interface AWWebTabEventData {
  url: string;
  title: string;
  audible?: boolean;
  incognito?: boolean;
}

/**
 * Editor activity event data
 */
export interface AWEditorEventData {
  file: string;
  project: string;
  language: string;
}

/**
 * Heartbeat request for efficient event submission
 */
export interface AWHeartbeat {
  timestamp: string; // ISO8601 timestamp
  duration: number;
  data: Record<string, unknown>;
}

/**
 * Server info response
 */
export interface AWServerInfo {
  hostname: string;
  version: string;
  testing: boolean;
  device_id: string;
}

/**
 * Bucket export format (bucket with all events)
 */
export interface AWBucketExport {
  id: string;
  name?: string;
  type: string;
  client: string;
  hostname: string;
  created: string;
  data?: Record<string, unknown>;
  last_updated?: string;
  events: AWEvent[];
}

/**
 * Query parameters for getting events
 */
export interface AWGetEventsParams {
  start?: string; // ISO8601 timestamp
  end?: string; // ISO8601 timestamp
  limit?: number;
}

/**
 * Usage summary entry
 */
export interface AWUsageSummary {
  app: string;
  total_seconds: number;
}

// Standard bucket types
export const AW_BUCKET_TYPES = {
  CURRENT_WINDOW: 'currentwindow',
  AFK_STATUS: 'afkstatus',
  WEB_TAB: 'web.tab.current',
  EDITOR_ACTIVITY: 'app.editor.activity',
} as const;

// Standard client names
export const AW_CLIENTS = {
  LOOPD: 'loopd',
  AW_WATCHER_WINDOW: 'aw-watcher-window',
  AW_WATCHER_AFK: 'aw-watcher-afk',
  AW_WATCHER_WEB: 'aw-watcher-web',
  AWATCHER: 'awatcher',
} as const;

// ============================================================
// Legacy types (for backwards compatibility)
// ============================================================

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