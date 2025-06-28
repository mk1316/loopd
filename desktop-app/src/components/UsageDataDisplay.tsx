import { UsageDataDisplayProps } from '@/types';
import { APP_CONSTANTS } from '@/lib/constants';
import { formatTime } from '@/lib/timeUtils';

export function UsageDataDisplay({ usage }: UsageDataDisplayProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-4 h-4 rounded-full bg-indigo-400 animate-glow"></div>
        <h2 className="text-2xl font-semibold text-indigo-300">
          {APP_CONSTANTS.USAGE_DATA}
        </h2>
      </div>
      
      {usage.length === 0 ? (
        <div className="usage-card p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-slate-300 text-lg mb-2">{APP_CONSTANTS.NO_USAGE_DATA}</p>
          <p className="text-slate-400 text-sm">
            {APP_CONSTANTS.NO_USAGE_DATA_HINT}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {usage.map((summary) => (
            <div 
              key={`${summary.day}-${summary.app_name}`}
              className="usage-card p-6 hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                  <span className="app-name font-semibold">{summary.app_name}</span>
                </div>
                <span className="time-display font-mono text-lg">
                  {formatTime(summary.total_seconds)}
                </span>
              </div>
              
              <div className="w-full bg-slate-700/50 rounded-full h-2 mb-2">
                <div 
                  className="usage-bar h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min((summary.total_seconds / 3600) * 100, 100)}%` 
                  }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-slate-400">
                <span>Date: {summary.day}</span>
                <span>{Math.round((summary.total_seconds / 3600) * 100)}% of max</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 