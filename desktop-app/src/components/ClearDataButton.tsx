import { ClearDataButtonProps } from '@/types';
import { APP_CONSTANTS } from '@/lib/constants';

export function ClearDataButton({ onClear, isClearing }: ClearDataButtonProps) {
  return (
    <button
      onClick={onClear}
      disabled={isClearing}
      className="glass-effect text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl border border-red-500/30 hover:border-red-400/50 bg-gradient-to-r from-red-600/20 to-red-700/20 hover:from-red-600/30 hover:to-red-700/30 backdrop-blur-sm"
    >
      {isClearing ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-red-200">Clearing...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="text-red-200">{APP_CONSTANTS.CLEAR_ALL_DATA}</span>
        </>
      )}
    </button>
  );
} 