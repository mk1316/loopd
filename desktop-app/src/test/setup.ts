// Explicitly define window.__TAURI_INTERNALS__ with a plain function for invoke
// @ts-ignore
window.__TAURI_INTERNALS__ = { invoke: function() { return undefined } }

import '@testing-library/jest-dom'
import { vi } from 'vitest'
import { mockIPC, mockWindows, clearMocks } from '@tauri-apps/api/mocks'
import { randomFillSync } from 'crypto'

// jsdom doesn't come with a WebCrypto implementation
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: (buffer: any) => {
      return randomFillSync(buffer)
    },
  },
})

// Mock Tauri IPC (must be first)
mockIPC((cmd, args) => {
  const commandMap: Record<string, any> = {
    // App-specific commands
    'get_active_app': 'Discord',
    'get_block_rules': [
      {
        id: '1',
        device_id: 'test-device-id',
        user_id: null,
        app_name: 'Discord',
        block_type: 'time',
        time_window_start: '09:00',
        time_window_end: '17:00',
        daily_limit_minutes: null,
        strictness: 'hard',
        enabled: true,
        synced: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
    ],
    'create_block_rule': 'new-rule-id',
    'update_block_rule': true,
    'delete_block_rule': true,
    'evaluate_block_status': {
      is_blocked: true,
      rule: {
        id: '1',
        device_id: 'test-device-id',
        user_id: null,
        app_name: 'Discord',
        block_type: 'time',
        time_window_start: '09:00',
        time_window_end: '17:00',
        daily_limit_minutes: null,
        strictness: 'hard',
        enabled: true,
        synced: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      reason: 'Time-based block: 09:00 - 17:00',
      can_override: false,
    },
    'get_usage_data': [
      {
        day: '2024-01-01',
        app_name: 'Discord',
        total_seconds: 3600,
      }
    ],
    'clear_usage_data': true,
    'get_device_id': 'test-device-id',
    // Additional command names used in the app
    'get_usage_summary': [
      {
        day: '2024-01-01',
        app_name: 'Discord',
        total_seconds: 3600,
      }
    ],
    'get_app_device_id': 'test-device-id',
    'get_sessions_command': [
      {
        id: 'session-1',
        device_id: 'test-device-id',
        user_id: null,
        app_name: 'Discord',
        window_title: 'Discord',
        start_time: '2024-01-01T09:00:00Z',
        end_time: '2024-01-01T10:00:00Z',
        duration_sec: 3600,
        created_at: '2024-01-01T09:00:00Z',
      }
    ],
    'get_block_rules_command': [
      {
        id: '1',
        device_id: 'test-device-id',
        user_id: null,
        app_name: 'Discord',
        block_type: 'time',
        time_window_start: '09:00',
        time_window_end: '17:00',
        daily_limit_minutes: null,
        strictness: 'hard',
        enabled: true,
        synced: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
    ],
    'evaluate_block_status_command': {
      is_blocked: true,
      rule: {
        id: '1',
        device_id: 'test-device-id',
        user_id: null,
        app_name: 'Discord',
        block_type: 'time',
        time_window_start: '09:00',
        time_window_end: '17:00',
        daily_limit_minutes: null,
        strictness: 'hard',
        enabled: true,
        synced: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      reason: 'Time-based block: 09:00 - 17:00',
      can_override: false,
    },
    // Handle Tauri event plugin commands to suppress warnings
    'plugin:event|listen': () => undefined,
    'plugin:event|unlisten': () => undefined,
  }
  
  const result = commandMap[cmd]
  if (result !== undefined) {
    return result
  }
  
  throw new Error(`Unknown Tauri command: ${cmd}`)
})

// Fallback: If window.__TAURI_INTERNALS__.invoke is still undefined, mock it as a function
// @ts-ignore
if (typeof window.__TAURI_INTERNALS__ !== 'undefined' && typeof window.__TAURI_INTERNALS__.invoke !== 'function') {
  // @ts-ignore
  window.__TAURI_INTERNALS__.invoke = () => undefined
}

// Mock Tauri windows
mockWindows('main')

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
  })),
}))

// Mock Tauri internals for event plugin
// @ts-ignore
if (!window.__TAURI_INTERNALS__) {
  // @ts-ignore
  window.__TAURI_INTERNALS__ = {};
}
// @ts-ignore
window.__TAURI_INTERNALS__.invoke = window.__TAURI_INTERNALS__.invoke || (async () => undefined);

// @ts-ignore
if (!window.__TAURI_EVENT_PLUGIN_INTERNALS__) {
  // @ts-ignore
  window.__TAURI_EVENT_PLUGIN_INTERNALS__ = {};
}
// @ts-ignore
window.__TAURI_EVENT_PLUGIN_INTERNALS__.unregisterListener = window.__TAURI_EVENT_PLUGIN_INTERNALS__.unregisterListener || (() => undefined);

// Clear mocks after each test
afterEach(() => {
  clearMocks()
}) 