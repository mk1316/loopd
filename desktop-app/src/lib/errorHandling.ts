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

// Error handling utilities for Supabase operations

export interface SyncError {
  code: string;
  message: string;
  details?: string;
  timestamp: Date;
  operation: 'sync' | 'auth' | 'connection' | 'database';
}

export class SupabaseErrorHandler {
  private static errors: SyncError[] = [];

  static logError(error: unknown, operation: SyncError['operation'], context?: string): SyncError {
    const syncError: SyncError = {
      code: this.getErrorCode(error),
      message: this.getErrorMessage(error),
      details: context,
      timestamp: new Date(),
      operation,
    };

    this.errors.push(syncError);
    console.error(`[${operation.toUpperCase()}] Error:`, syncError);

    return syncError;
  }

  static getErrorCode(error: unknown): string {
    if (typeof error === 'object' && error && 'code' in error) return (error as { code: string }).code;
    if (typeof error === 'object' && error && 'status' in error) return String((error as { status: string | number }).status);
    return 'UNKNOWN';
  }

  static getErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error && 'message' in error && typeof (error as { message: string }).message === 'string') {
      const message = (error as { message: string }).message;
      if (message.includes('permission denied')) {
        return 'Access denied. Please check your authentication.';
      }
      if (message.includes('duplicate key')) {
        return 'Data already exists. Sync will continue normally.';
      }
      if (message.includes('network')) {
        return 'Network error. Please check your internet connection.';
      }
      return message;
    }
    if (typeof error === 'string') return error;
    if (typeof error === 'object' && error && 'toString' in error && typeof (error as { toString: () => string }).toString === 'function') return (error as { toString: () => string }).toString();
    return 'An unexpected error occurred';
  }

  static getUserFriendlyMessage(error: SyncError): string {
    switch (error.code) {
      case '42501':
        return 'Access denied. Please sign in again.';
      case '23505':
        return 'Data already synced.';
      case 'PGRST301':
        return 'Network error. Please check your connection.';
      case 'PGRST116':
        return 'Invalid request. Please try again.';
      default:
        return error.message;
    }
  }

  static getRecentErrors(limit: number = 10): SyncError[] {
    return this.errors
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  static clearErrors(): void {
    this.errors = [];
  }

  static hasRecentErrors(minutes: number = 5): boolean {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.errors.some(error => error.timestamp > cutoff);
  }
}

// Utility functions for common error scenarios
export const handleSyncError = (error: unknown, context?: string) => {
  return SupabaseErrorHandler.logError(error, 'sync', context);
};

export const handleAuthError = (error: unknown, context?: string) => {
  return SupabaseErrorHandler.logError(error, 'auth', context);
};

export const handleConnectionError = (error: unknown, context?: string) => {
  return SupabaseErrorHandler.logError(error, 'connection', context);
};

// Retry logic for failed operations
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      console.warn(`Operation failed, retrying in ${waitTime}ms (attempt ${attempt}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}; 