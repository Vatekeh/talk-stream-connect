
/**
 * Formats message timestamps to readable time
 * @param timestamp - ISO timestamp string
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
