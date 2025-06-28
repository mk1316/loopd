import { CurrentAppDisplayProps } from '@/types';
import { APP_CONSTANTS } from '@/lib/constants';

export function CurrentAppDisplay({ currentApp, lastUpdate }: CurrentAppDisplayProps) {
  return (
    <div className="active-app-card rounded-xl p-6 h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-3 h-3 rounded-full status-active animate-pulse"></div>
        <h2 className="text-xl font-semibold text-green-300">
          {APP_CONSTANTS.CURRENTLY_ACTIVE}
        </h2>
      </div>
      <p className="app-name text-2xl font-mono mb-3">{currentApp}</p>
      {lastUpdate && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-green-400/70">
            {APP_CONSTANTS.LAST_UPDATED}
          </span>
          <span className="time-display text-sm font-mono">
            {lastUpdate}
          </span>
        </div>
      )}
    </div>
  );
} 