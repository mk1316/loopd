import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { logError } from '@/lib/errorHandling';

export interface UpdateInfo {
  version: string;
  date?: string;
  body?: string;
}

export interface UpdaterStatus {
  currentVersion: string;
  isChecking: boolean;
  isDownloading: boolean;
  isInstalling: boolean;
  updateAvailable: UpdateInfo | null;
  error: string | null;
}

export function useUpdater() {
  const [status, setStatus] = useState<UpdaterStatus>({
    currentVersion: '',
    isChecking: false,
    isDownloading: false,
    isInstalling: false,
    updateAvailable: null,
    error: null,
  });

  // Get current version on mount
  useEffect(() => {
    getCurrentVersion();
  }, []);

  // Listen for updater events
  useEffect(() => {
    const unlistenFns: (() => void)[] = [];

    const setupListeners = async () => {
      // Update available
      const unlistenUpdateAvailable = await listen('update-available', (event) => {
        setStatus(prev => ({
          ...prev,
          updateAvailable: event.payload as UpdateInfo,
          error: null,
        }));
      });
      unlistenFns.push(unlistenUpdateAvailable);

      // Update downloaded
      const unlistenUpdateDownloaded = await listen('update-downloaded', (event) => {
        setStatus(prev => ({
          ...prev,
          isDownloading: false,
          updateAvailable: event.payload as UpdateInfo,
        }));
      });
      unlistenFns.push(unlistenUpdateDownloaded);

      // Update installed
      const unlistenUpdateInstalled = await listen('update-installed', () => {
        setStatus(prev => ({
          ...prev,
          isInstalling: false,
          updateAvailable: null,
        }));
      });
      unlistenFns.push(unlistenUpdateInstalled);

      // No update available
      const unlistenNoUpdate = await listen('no-update-available', () => {
        setStatus(prev => ({
          ...prev,
          isChecking: false,
          updateAvailable: null,
          error: null,
        }));
      });
      unlistenFns.push(unlistenNoUpdate);

      // Update error
      const unlistenError = await listen('update-error', (event) => {
        setStatus(prev => ({
          ...prev,
          isChecking: false,
          isDownloading: false,
          isInstalling: false,
          error: event.payload as string,
        }));
      });
      unlistenFns.push(unlistenError);
    };

    setupListeners();

    return () => {
      unlistenFns.forEach(unlisten => unlisten());
    };
  }, []);

  const getCurrentVersion = async () => {
    try {
      const version = await invoke<string>('get_current_version');
      setStatus(prev => ({ ...prev, currentVersion: version }));
    } catch (e) {
      logError(e, 'getCurrentVersion');
    }
  };

  const checkForUpdates = async () => {
    try {
      setStatus(prev => ({ ...prev, isChecking: true, error: null }));
      await invoke('check_for_updates');
    } catch (e) {
      logError(e, 'checkForUpdates');
      setStatus(prev => ({ 
        ...prev, 
        isChecking: false, 
        error: e instanceof Error ? e.message : 'Failed to check for updates' 
      }));
    }
  };

  const installUpdate = async () => {
    try {
      setStatus(prev => ({ ...prev, isInstalling: true, error: null }));
      await invoke('install_update');
    } catch (e) {
      logError(e, 'installUpdate');
      setStatus(prev => ({ 
        ...prev, 
        isInstalling: false, 
        error: e instanceof Error ? e.message : 'Failed to install update' 
      }));
    }
  };

  const clearError = () => {
    setStatus(prev => ({ ...prev, error: null }));
  };

  return {
    status,
    checkForUpdates,
    installUpdate,
    clearError,
  };
} 