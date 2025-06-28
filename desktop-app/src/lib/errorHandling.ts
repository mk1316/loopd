/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Handles Tauri-specific errors with proper context
 */
export function handleTauriError(error: unknown, context: string): AppError {
  const message = error instanceof Error ? error.message : String(error);
  return new AppError(`${context}: ${message}`, 'TAURI_ERROR', error);
}

/**
 * Logs errors with consistent formatting
 */
export function logError(error: unknown, context: string): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`[${context}] Error:`, errorMessage);
  
  if (error instanceof Error && error.stack) {
    console.error(`[${context}] Stack trace:`, error.stack);
  }
}

/**
 * Safely executes an async function and handles errors
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  context: string,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    logError(error, context);
    return fallback;
  }
} 