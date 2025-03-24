export const MAX_SECONDS = 10800; // 3 hours in seconds

/**
 * Parses a time value string and ensures it doesn't exceed the maximum
 * @param value - The string value to parse
 * @param max - The maximum allowed value
 * @returns The parsed number, capped at max
 */
export const parseTimeValue = (value: string, max: number): number => {
  const parsed = parseInt(value || "0", 10);
  return isNaN(parsed) ? 0 : Math.min(parsed, max);
};

/**
 * Formats a number as a time string, empty string if zero
 * @param value - The number to format
 * @returns Formatted string
 */
export const formatTimeValue = (value: number): string => {
  return value > 0 ? value.toString() : "";
};

/**
 * Calculates total seconds from hours, minutes, and seconds
 * @param h - Hours
 * @param m - Minutes
 * @param s - Seconds
 * @returns Total seconds, capped at MAX_SECONDS
 */
export const calculateTotalSeconds = (
  h: number,
  m: number,
  s: number
): number => {
  return Math.min(h * 3600 + m * 60 + s, MAX_SECONDS);
};

/**
 * Converts total seconds into an object with hours, minutes, and seconds
 * @param totalSeconds - The total number of seconds to convert
 * @returns Object containing hours, minutes, and seconds
 */
export const secondsToTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
};

/**
 * Formats seconds into a human-readable duration string
 * @param seconds - Number of seconds
 * @returns Formatted duration string (e.g., "1h 30m")
 */
export const formatDuration = (seconds: number): string => {
  const { hours, minutes, seconds: secs } = secondsToTime(seconds);
  const parts = [];

  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 && hours === 0) parts.push(`${secs}s`);

  return parts.join(" ") || "0s";
};
