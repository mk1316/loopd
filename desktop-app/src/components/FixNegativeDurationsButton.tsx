import { useState } from 'react';

interface FixNegativeDurationsButtonProps {
  onFix?: () => void;
}

export function FixNegativeDurationsButton({ onFix }: FixNegativeDurationsButtonProps) {
  const [isFixing, setIsFixing] = useState(false);

  const fixNegativeDurations = async () => {
    try {
      setIsFixing(true);
      console.log('FixNegativeDurationsButton: Fixing negative durations...');
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('fix_negative_durations_command');
      console.log('FixNegativeDurationsButton: Fix completed successfully');
      alert('Negative durations fixed successfully!');
      onFix?.();
    } catch (error) {
      console.error('FixNegativeDurationsButton: Fix failed:', error);
      alert(`Failed to fix negative durations: ${error}`);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <button
      onClick={fixNegativeDurations}
      disabled={isFixing}
      className={`
        group relative inline-flex items-center justify-center
        px-5 py-2.5 rounded-md font-medium text-sm leading-5
        transition-all duration-200 ease-out
        border border-transparent
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500
        ${isFixing 
          ? 'bg-gray-400 text-gray-200 cursor-not-allowed shadow-sm' 
          : 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white cursor-pointer shadow-sm hover:shadow-md'
        }
      `}
      style={{ pointerEvents: 'auto' }}
    >
      {isFixing ? (
        <>
          <svg 
            className="animate-spin -ml-0.5 mr-2 h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Fixing...
        </>
      ) : (
        <>
          <svg 
            className="w-4 h-4 mr-2 opacity-90 group-hover:opacity-100" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
          Fix Negative Durations
        </>
      )}
    </button>
  );
} 