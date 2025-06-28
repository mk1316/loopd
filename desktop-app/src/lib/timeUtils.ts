/**
 * Formats seconds into a human-readable time string
 * @param seconds - The number of seconds to format
 * @returns Formatted time string (e.g., "2h 30m 45s", "45m 30s", "30s")
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Gets the current time as a localized string
 * @returns Current time in locale string format
 */
export function getCurrentTimeString(): string {
  return new Date().toLocaleTimeString();
} 