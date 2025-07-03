import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import { BlockRulesManager } from '../BlockRulesManager'
import { mockBlockRules } from '@/test/fixtures/block-rules'

// Mock the Tauri invoke function
vi.mock('@tauri-apps/api/core', () => {
  const mockInvoke = vi.fn()
  return { invoke: mockInvoke }
})

describe('BlockRulesManager', () => {
  const defaultProps = {
    blockRules: mockBlockRules,
    deviceId: 'test-device-id',
    onRefresh: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders block rules list', async () => {
    render(<BlockRulesManager {...defaultProps} />)
    
    expect(screen.getByText('Discord')).toBeInTheDocument()
    expect(screen.getByText('YouTube')).toBeInTheDocument()
  })

  it('opens create dialog when add button is clicked', async () => {
    render(<BlockRulesManager {...defaultProps} />)
    
    // Click add button to open dialog
    fireEvent.click(screen.getByText(/add block rule/i))
    
    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Create Block Rule')).toBeInTheDocument()
    })
    
    // Verify dialog content
    expect(screen.getByLabelText(/application name/i)).toBeInTheDocument()
    expect(screen.getByText(/block type/i)).toBeInTheDocument()
  })

  it('updates an existing block rule', async () => {
    const { invoke } = await import('@tauri-apps/api/core')
    vi.mocked(invoke).mockResolvedValue(true)
    
    render(<BlockRulesManager {...defaultProps} />)
    
    // Click edit button for Discord rule
    const editButtons = screen.getAllByText(/edit/i)
    fireEvent.click(editButtons[0])
    
    // Wait for edit dialog to open
    await waitFor(() => {
      expect(screen.getByText('Edit Block Rule')).toBeInTheDocument()
    })
    
    // Modify the rule
    fireEvent.change(screen.getByLabelText(/end time/i), {
      target: { value: '19:00' }
    })
    
    // Save changes
    fireEvent.click(screen.getByText(/update/i))
    
    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('update_block_rule_command', {
        ruleId: '1',
        appName: 'Discord',
        timeWindowStart: '09:00',
        timeWindowEnd: '19:00',
        dailyLimitMinutes: null,
        strictness: 'hard',
        enabled: true,
      })
    })
  })

  it('deletes a block rule', async () => {
    const { invoke } = await import('@tauri-apps/api/core')
    vi.mocked(invoke).mockResolvedValue(true)
    
    // Mock window.confirm to return true
    window.confirm = vi.fn(() => true)
    
    render(<BlockRulesManager {...defaultProps} />)
    
    // Click delete button for Discord rule
    const deleteButtons = screen.getAllByText(/delete/i)
    fireEvent.click(deleteButtons[0])
    
    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('delete_block_rule_command', {
        ruleId: '1'
      })
    })
  })

  it('handles creation errors gracefully', async () => {
    const { invoke } = await import('@tauri-apps/api/core')
    vi.mocked(invoke).mockRejectedValue(new Error('Failed to create rule'))
    
    render(<BlockRulesManager {...defaultProps} />)
    
    // Try to create a rule
    fireEvent.click(screen.getByText(/add block rule/i))
    
    await waitFor(() => {
      expect(screen.getByText('Create Block Rule')).toBeInTheDocument()
    })
    
    fireEvent.change(screen.getByLabelText(/application name/i), {
      target: { value: 'Chrome' }
    })
    
    // Use getAllByText to handle multiple "Create" elements
    const createButtons = screen.getAllByText(/create/i)
    fireEvent.click(createButtons[createButtons.length - 1]) // Click the button, not the title
    
    await waitFor(() => {
      expect(invoke).toHaveBeenCalled()
    })
  })

  it('shows empty state when no rules exist', () => {
    render(<BlockRulesManager 
      {...defaultProps} 
      blockRules={[]} 
    />)
    
    expect(screen.getByText(/no block rules configured yet/i)).toBeInTheDocument()
    expect(screen.getByText(/create your first rule/i)).toBeInTheDocument()
  })

  it('displays rule information correctly', () => {
    render(<BlockRulesManager {...defaultProps} />)
    
    // Check Discord rule details
    expect(screen.getByText('Discord')).toBeInTheDocument()
    expect(screen.getByText(/time: 09:00 - 17:00/i)).toBeInTheDocument()
    expect(screen.getByText('hard')).toBeInTheDocument()
    expect(screen.getAllByText('Enabled')).toHaveLength(2) // Both rules are enabled
    
    // Check YouTube rule details
    expect(screen.getByText('YouTube')).toBeInTheDocument()
    expect(screen.getByText(/usage: 120 min\/day/i)).toBeInTheDocument()
    expect(screen.getByText('soft')).toBeInTheDocument()
  })

  it('closes dialog when cancel is clicked', async () => {
    render(<BlockRulesManager {...defaultProps} />)
    
    // Open dialog
    fireEvent.click(screen.getByText(/add block rule/i))
    
    await waitFor(() => {
      expect(screen.getByText('Create Block Rule')).toBeInTheDocument()
    })
    
    // Click cancel
    fireEvent.click(screen.getByText(/cancel/i))
    
    await waitFor(() => {
      expect(screen.queryByText('Create Block Rule')).not.toBeInTheDocument()
    })
  })
}) 