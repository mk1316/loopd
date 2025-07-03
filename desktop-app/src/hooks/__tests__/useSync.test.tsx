import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSync } from '../useSync'

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => {
  const mockInvoke = vi.fn()
  return { invoke: mockInvoke }
})

// Mock Supabase
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    upsert: vi.fn(() => ({
      select: vi.fn(),
    })),
  })),
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

// Mock UserContext
vi.mock('@/contexts/UserContext', () => ({
  useUser: () => ({
    user: { id: 'test-user' },
    session: { access_token: 'test-token' },
  }),
}))

describe('useSync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with default state', async () => {
    const { invoke } = await import('@tauri-apps/api/core')
    vi.mocked(invoke).mockResolvedValue('test-device-id')
    
    const { result } = renderHook(() => useSync())
    
    // Wait for device ID to be fetched
    await waitFor(() => {
      expect(result.current.deviceId).toBe('test-device-id')
    })
    
    expect(result.current.syncStatus.isSyncing).toBe(false)
    expect(result.current.syncStatus.lastSyncTime).toBeNull()
    expect(result.current.syncStatus.error).toBeNull()
    expect(result.current.syncStatus.unsyncedCount).toBe(0)
  })

  it('performs successful sync operation', async () => {
    const { invoke } = await import('@tauri-apps/api/core')
    vi.mocked(invoke).mockResolvedValue(true)

    const { result } = renderHook(() => useSync())

    await act(async () => {
      await result.current.syncData()
    })

    expect(result.current.syncStatus.isSyncing).toBe(false)
    expect(result.current.syncStatus.error).toBeNull()
    expect(result.current.syncStatus.lastSyncTime).toBeTruthy()
    expect(result.current.syncStatus.unsyncedCount).toBe(0)
  })

  it('handles sync errors gracefully', async () => {
    const { invoke } = await import('@tauri-apps/api/core')
    vi.mocked(invoke)
      .mockResolvedValueOnce('test-device-id') // Device ID fetch
      .mockRejectedValueOnce(new Error('Network error')) // Sync error

    const { result } = renderHook(() => useSync())

    // Wait for device ID to be fetched
    await waitFor(() => {
      expect(result.current.deviceId).toBe('test-device-id')
    })

    await act(async () => {
      await result.current.syncData()
    })

    expect(result.current.syncStatus.isSyncing).toBe(false)
    expect(result.current.syncStatus.error).toBe('Network error')
  })

  it('prevents multiple simultaneous sync operations', async () => {
    const { invoke } = await import('@tauri-apps/api/core')
    vi.mocked(invoke)
      .mockResolvedValueOnce('test-device-id') // Device ID fetch
      .mockImplementation(() => new Promise(() => {})) // Never resolving promise

    const { result } = renderHook(() => useSync())

    // Wait for device ID to be fetched
    await waitFor(() => {
      expect(result.current.deviceId).toBe('test-device-id')
    })

    // Start first sync
    act(() => {
      result.current.syncData()
    })

    expect(result.current.syncStatus.isSyncing).toBe(true)

    // Try to start second sync while first is running
    act(() => {
      result.current.syncData()
    })

    expect(result.current.syncStatus.isSyncing).toBe(true)
  })

  it('provides device ID after initialization', async () => {
    const { invoke } = await import('@tauri-apps/api/core')
    vi.mocked(invoke).mockResolvedValue('test-device-id')

    const { result } = renderHook(() => useSync())

    await waitFor(() => {
      expect(result.current.deviceId).toBe('test-device-id')
    })
  })
}) 