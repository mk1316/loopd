'use client';

import { useEffect } from 'react';
import { useAppTracking } from '@/hooks/useAppTracking';
import { 
  CurrentAppDisplay, 
  DeviceIdDisplay, 
  UsageDataDisplay, 
  ClearDataButton,
  ProtectedRoute,
  UserProfile,
  Navigation,
  SyncStatus
} from '@/components';
import { APP_CONSTANTS } from '@/lib/constants';
import { listen } from '@tauri-apps/api/event';

function Dashboard() {
  const {
    usage,
    currentApp,
    lastUpdate,
    deviceId,
    isClearing,
    clearAllData,
  } = useAppTracking();

  useEffect(() => {
    // Add global click handler to debug
    const handleGlobalClick = (event: MouseEvent) => {
      console.log('Global click detected:', event.target);
      console.log('Click coordinates:', event.clientX, event.clientY);
    };

    // Add Tauri event listener test
    const setupTauriEvents = async () => {
      try {
        console.log('Setting up Tauri event listener...');
        const unlisten = await listen('test-event', (event) => {
          console.log('Tauri event received:', event);
        });
        console.log('Tauri event listener set up successfully');
        
        // Test emit after 2 seconds
        setTimeout(async () => {
          try {
            console.log('Testing Tauri event emit...');
            const { emit } = await import('@tauri-apps/api/event');
            await emit('test-event', { message: 'Hello from frontend!' });
            console.log('Tauri event emit test completed');
          } catch (error) {
            console.error('Tauri event emit test failed:', error);
          }
        }, 2000);
      } catch (error) {
        console.error('Failed to set up Tauri event listener:', error);
      }
    };

    document.addEventListener('click', handleGlobalClick);
    setupTauriEvents();
    
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="app-container p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                {APP_CONSTANTS.TITLE}
              </h1>
              <p className="text-lg md:text-xl text-slate-300 font-medium">
                {APP_CONSTANTS.DESCRIPTION}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <SyncStatus />
              <UserProfile />
            <ClearDataButton onClear={clearAllData} isClearing={isClearing} />
            </div>
          </div>
          
          <Navigation />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CurrentAppDisplay currentApp={currentApp} lastUpdate={lastUpdate} />
            <DeviceIdDisplay deviceId={deviceId} />
          </div>
        </div>
        
        <div className="app-container p-6 md:p-8">
          <UsageDataDisplay usage={usage} />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
