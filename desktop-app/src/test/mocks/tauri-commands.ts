import { vi } from 'vitest'
import { mockBlockRules, mockUsageData, mockBlockStatus } from '../fixtures/block-rules'

export const mockTauriCommands = {
  get_active_app: vi.fn().mockResolvedValue('Discord'),
  get_block_rules_command: vi.fn().mockResolvedValue(mockBlockRules),
  create_block_rule_command: vi.fn().mockResolvedValue('new-rule-id'),
  update_block_rule_command: vi.fn().mockResolvedValue(true),
  delete_block_rule_command: vi.fn().mockResolvedValue(true),
  evaluate_block_status_command: vi.fn().mockResolvedValue(mockBlockStatus),
  get_usage_data_command: vi.fn().mockResolvedValue(mockUsageData),
  clear_usage_data_command: vi.fn().mockResolvedValue(true),
  get_device_id_command: vi.fn().mockResolvedValue('test-device-id'),
}

// Setup mocks
export const setupTauriMocks = () => {
  const { invoke } = require('@tauri-apps/api/core')
  // Directly assign mockImplementation
  invoke.mockImplementation?.((command: string, ...args: any[]) => {
    const commandMap: Record<string, any> = {
      'get_active_app': mockTauriCommands.get_active_app,
      'get_block_rules': mockTauriCommands.get_block_rules_command,
      'create_block_rule': mockTauriCommands.create_block_rule_command,
      'update_block_rule': mockTauriCommands.update_block_rule_command,
      'delete_block_rule': mockTauriCommands.delete_block_rule_command,
      'evaluate_block_status': mockTauriCommands.evaluate_block_status_command,
      'get_usage_data': mockTauriCommands.get_usage_data_command,
      'clear_usage_data': mockTauriCommands.clear_usage_data_command,
      'get_device_id': mockTauriCommands.get_device_id_command,
    }
    const mockFn = commandMap[command]
    if (mockFn) {
      return mockFn(...args)
    }
    throw new Error(`Unknown Tauri command: ${command}`)
  })
} 