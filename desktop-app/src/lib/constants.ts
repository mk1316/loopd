export const APP_CONSTANTS = {
  TITLE: 'Loopd - App Usage Tracker',
  CURRENTLY_ACTIVE: 'Currently Active',
  DEVICE_ID: 'Device ID',
  USAGE_DATA: 'Usage Data',
  LAST_UPDATED: 'Last updated:',
  CLEAR_ALL_DATA: 'Clear All Data',
  CLEARING: 'Clearing...',
  NO_USAGE_DATA: 'No usage data available yet. Start tracking to see data.',
  NO_USAGE_DATA_HINT: 'Try switching between different applications to see usage tracking in action.',
  DEVICE_ID_DESCRIPTION: 'This ID persists across app restarts and data clearing',
  CLEAR_CONFIRMATION: 'Are you sure you want to clear all usage data? This action cannot be undone.',
  CLEAR_ERROR: 'Failed to clear data. Please try again.',
} as const;

export const REFRESH_INTERVAL = 5000; // 5 seconds
export const CHECK_INTERVAL = 1000; // 1 second

export const ERROR_MESSAGES = {
  FETCH_USAGE_FAILED: 'Failed to fetch usage data',
  FETCH_CURRENT_APP_FAILED: 'Failed to fetch current app',
  FETCH_DEVICE_ID_FAILED: 'Failed to fetch device ID',
  CLEAR_DATA_FAILED: 'Failed to clear data',
} as const;

export const STYLING = {
  ANIMATION_DURATION: '300ms',
  TRANSITION_EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
  GLASS_BLUR: 'blur(10px)',
  BORDER_RADIUS: '0.75rem',
  SHADOW_LIGHT: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  SHADOW_MEDIUM: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  SHADOW_HEAVY: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
} as const; 