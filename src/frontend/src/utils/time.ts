/**
 * Utility functions for formatting backend Time (bigint nanoseconds) into readable date/time strings
 */

/**
 * Convert backend Time (nanoseconds since epoch) to JavaScript Date
 */
export function timeToDate(time: bigint): Date {
  // Convert nanoseconds to milliseconds
  const milliseconds = Number(time / BigInt(1000000));
  return new Date(milliseconds);
}

/**
 * Format backend Time as a readable date string (e.g., "Feb 14, 2026")
 */
export function formatDate(time: bigint): string {
  const date = timeToDate(time);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format backend Time as a readable time string (e.g., "2:30 PM")
 */
export function formatTime(time: bigint): string {
  const date = timeToDate(time);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format backend Time as a full date and time string (e.g., "Feb 14, 2026 at 2:30 PM")
 */
export function formatDateTime(time: bigint): string {
  return `${formatDate(time)} at ${formatTime(time)}`;
}

/**
 * Format backend Time as a relative time string (e.g., "2 hours ago", "just now")
 */
export function formatRelativeTime(time: bigint): string {
  const date = timeToDate(time);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  return formatDate(time);
}
