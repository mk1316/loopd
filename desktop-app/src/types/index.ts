// Usage data types
export interface UsageSummary {
  day: string;
  app_name: string;
  total_seconds: number;
}

// App state types
export interface AppState {
  usage: UsageSummary[];
  currentApp: string;
  lastUpdate: string;
  deviceId: string;
  isClearing: boolean;
}

// App actions types
export interface AppActions {
  fetchUsage: () => Promise<void>;
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

export interface ClearDataButtonProps {
  onClear: () => Promise<void>;
  isClearing: boolean;
} 