/**
 * Format a nanosecond timestamp (bigint) to a human-readable relative time.
 */
export function formatDistanceToNow(timestampNs: bigint): string {
  const timestampMs = Number(timestampNs) / 1_000_000;
  const now = Date.now();
  const diff = now - timestampMs;

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  // Format as date
  const date = new Date(timestampMs);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function formatDateTime(timestampNs: bigint): string {
  const timestampMs = Number(timestampNs) / 1_000_000;
  const date = new Date(timestampMs);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
