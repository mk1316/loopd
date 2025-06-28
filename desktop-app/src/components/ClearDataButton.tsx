import { ClearDataButtonProps } from '@/types';
import { APP_CONSTANTS } from '@/lib/constants';

export function ClearDataButton({ onClear, isClearing }: ClearDataButtonProps) {
  const testClearCommand = async () => {
    try {
      console.log('ClearDataButton: Testing clear command directly...');
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('clear_all_data_and_reset_command');
      console.log('ClearDataButton: Clear command executed successfully');
      alert('Clear command works!');
    } catch (error) {
      console.error('ClearDataButton: Clear command failed:', error);
      alert(`Clear command failed: ${error}`);
    }
  };

  return (
    <button
      onClick={testClearCommand}
      disabled={isClearing}
      className={`
        group relative inline-flex items-center justify-center
        px-5 py-2.5 rounded-md font-medium text-sm leading-5
        transition-all duration-200 ease-out
        border border-transparent
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
        ${isClearing 
          ? 'bg-gray-400 text-gray-200 cursor-not-allowed shadow-sm' 
          : 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white cursor-pointer shadow-sm hover:shadow-md'
        }
      `}
      style={{ pointerEvents: 'auto' }}
    >
      {isClearing ? (
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
          Clearing...
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
            />
          </svg>
          Clear All Data
        </>
      )}
    </button>
  );
} 