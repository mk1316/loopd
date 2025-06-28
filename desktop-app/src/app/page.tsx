'use client';

import { useAppTracking } from '@/hooks/useAppTracking';
import { 
  CurrentAppDisplay, 
  DeviceIdDisplay, 
  UsageDataDisplay, 
  ClearDataButton,
  ProtectedRoute,
  UserProfile
} from '@/components';
import { APP_CONSTANTS } from '@/lib/constants';

function Dashboard() {
  const {
    usage,
    currentApp,
    lastUpdate,
    deviceId,
    isClearing,
    clearAllData,
  } = useAppTracking();

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
              <UserProfile />
              <ClearDataButton onClear={clearAllData} isClearing={isClearing} />
            </div>
          </div>
          
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
