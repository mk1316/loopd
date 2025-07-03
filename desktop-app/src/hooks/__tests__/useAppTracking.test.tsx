import { describe, it, expect } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAppTracking } from '../useAppTracking'

describe('useAppTracking', () => {
  it('fetches initial data on mount', async () => {
    const { result } = renderHook(() => useAppTracking())
    
    await waitFor(() => {
      expect(result.current.currentApp).toBe('Discord')
    })
    
    expect(result.current.deviceId).toBe('test-device-id')
  })

  it('evaluates block status for current app', async () => {
    const { result } = renderHook(() => useAppTracking())
    
    await act(async () => {
      result.current.evaluateBlockStatus()
    })
    
    expect(result.current.currentBlockStatus).toBeDefined()
  })
}) 