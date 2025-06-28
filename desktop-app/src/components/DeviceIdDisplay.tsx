import { DeviceIdDisplayProps } from '@/types';
import { APP_CONSTANTS } from '@/lib/constants';

export function DeviceIdDisplay({ deviceId }: DeviceIdDisplayProps) {
  return (
    <div className="device-id-card rounded-xl p-6 h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></div>
        <h2 className="text-xl font-semibold text-amber-300">
          {APP_CONSTANTS.DEVICE_ID}
        </h2>
      </div>
      <p className="font-mono text-sm text-amber-200 break-all mb-3 bg-slate-800/50 p-3 rounded-lg border border-amber-500/20">
        {deviceId}
      </p>
      <p className="text-xs text-amber-400/70">
        {APP_CONSTANTS.DEVICE_ID_DESCRIPTION}
      </p>
    </div>
  );
} 