import { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { BlockStatus } from '@/types';

export function useBlocking(deviceId: string) {
  const [currentBlockStatus, setCurrentBlockStatus] = useState<BlockStatus | null>(null);

  useEffect(() => {
    // Listen for app blocked events
    const unlisten = listen('app_blocked', (event) => {
      const blockStatus = event.payload as BlockStatus;
      console.log('App blocked:', blockStatus);
      setCurrentBlockStatus(blockStatus);
    });

    // Load initial blocking rules
    const loadBlockingRules = async () => {
      try {
        await invoke('refresh_blocking_rules_command', { deviceId });
      } catch (error) {
        console.error('Failed to load blocking rules:', error);
      }
    };

    loadBlockingRules();

    return () => {
      unlisten.then(f => f());
    };
  }, [deviceId]);

  const handleOverride = async () => {
    if (!currentBlockStatus?.rule) return;

    try {
      // Add temporary override
      await invoke('add_block_override_command', {
        appName: currentBlockStatus.rule.app_name,
      });

      // Clear the block status
      setCurrentBlockStatus(null);
    } catch (error) {
      console.error('Failed to add override:', error);
    }
  };

  const terminateBlockedApp = async (appName: string) => {
    try {
      await invoke('terminate_blocked_app_command', { appName });
    } catch (error) {
      console.error('Failed to terminate app:', error);
    }
  };

  const refreshBlockingRules = async () => {
    try {
      await invoke('refresh_blocking_rules_command', { deviceId });
    } catch (error) {
      console.error('Failed to refresh blocking rules:', error);
    }
  };

  return {
    currentBlockStatus,
    isBlockingEnabled: true,
    handleOverride,
    terminateBlockedApp,
    refreshBlockingRules,
    setCurrentBlockStatus,
  };
} 