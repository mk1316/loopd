'use client';

import { useSync } from '@/hooks/useSync';
import { useUser } from '@/contexts/UserContext';
import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export function SyncStatus() {
  const { user } = useUser();
  const { syncStatus, syncData, testConnection } = useSync();

  if (!user) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <CloudOff className="w-4 h-4" />
        <span className="text-sm">Not signed in</span>
      </div>
    );
  }

  const getStatusIcon = () => {
    if (syncStatus.isSyncing) {
      return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
    }
    if (syncStatus.error) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    if (syncStatus.unsyncedCount > 0) {
      return <Cloud className="w-4 h-4 text-yellow-500" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (syncStatus.isSyncing) {
      return 'Syncing...';
    }
    if (syncStatus.error) {
      return 'Sync error';
    }
    if (syncStatus.unsyncedCount > 0) {
      return `${syncStatus.unsyncedCount} unsynced`;
    }
    return 'Synced';
  };

  const handleSync = async () => {
    await syncData();
  };

  const handleTestConnection = async () => {
    await testConnection();
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className="text-sm text-slate-300">{getStatusText()}</span>
      </div>
      
      {syncStatus.lastSyncTime && (
        <span className="text-xs text-slate-500">
          Last sync: {new Date(syncStatus.lastSyncTime).toLocaleTimeString()}
        </span>
      )}
      
      <div className="flex items-center gap-2">
        <button
          onClick={handleSync}
          disabled={syncStatus.isSyncing}
          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {syncStatus.isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
        
        <button
          onClick={handleTestConnection}
          className="px-2 py-1 text-xs bg-slate-600 text-white rounded hover:bg-slate-700"
        >
          Test
        </button>
      </div>
      
      {syncStatus.error && (
        <div className="text-xs text-red-400 max-w-xs truncate" title={syncStatus.error}>
          {syncStatus.error}
        </div>
      )}
    </div>
  );
} 