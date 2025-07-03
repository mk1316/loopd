export const mockBlockRules = [
  {
    id: '1',
    device_id: 'test-device-id',
    user_id: null,
    app_name: 'Discord',
    block_type: 'time' as const,
    time_window_start: '09:00',
    time_window_end: '17:00',
    daily_limit_minutes: null,
    strictness: 'hard' as const,
    enabled: true,
    synced: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    device_id: 'test-device-id',
    user_id: null,
    app_name: 'YouTube',
    block_type: 'usage' as const,
    time_window_start: null,
    time_window_end: null,
    daily_limit_minutes: 120,
    strictness: 'soft' as const,
    enabled: true,
    synced: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

export const mockUsageData = [
  {
    day: '2024-01-01',
    app_name: 'Discord',
    total_seconds: 3600,
  },
  {
    day: '2024-01-01',
    app_name: 'YouTube',
    total_seconds: 1800,
  },
]

export const mockBlockStatus = {
  is_blocked: true,
  rule: mockBlockRules[0],
  reason: 'Time-based block: 09:00 - 17:00',
  can_override: false,
} 