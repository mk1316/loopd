import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils/test-utils'
import { BlockScreen } from '../BlockScreen'
import { mockBlockStatus } from '@/test/fixtures/block-rules'

describe('BlockScreen', () => {
  it('renders block screen when app is blocked', () => {
    render(<BlockScreen blockStatus={mockBlockStatus} deviceId="test-device-id" />)
    expect(screen.getByText('⛔ App Blocked')).toBeInTheDocument()
    expect(screen.getByText('Discord')).toBeInTheDocument()
    expect(screen.getByText('Time-based block: 09:00 - 17:00')).toBeInTheDocument()
  })

  it('shows override button for soft blocks', () => {
    const softBlockStatus = { ...mockBlockStatus, can_override: true }
    render(<BlockScreen blockStatus={softBlockStatus} deviceId="test-device-id" />)
    expect(screen.getByText('Override Block')).toBeInTheDocument()
  })
}) 