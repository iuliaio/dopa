import { format } from "date-fns";

const MILLISECONDS_PER_SECOND = 1000;

/**
 * Formats a schedule date into a human-readable string
 * @param scheduleDate - Can be a Firestore timestamp object, ISO string, or regular date string
 * @returns Formatted date string in the format "Month Day, Year" (e.g., "January 1, 2024") or null if invalid
 */
export const formatScheduleDate = (scheduleDate: any) => {
  if (!scheduleDate) return null;

  let date;

  if (typeof scheduleDate === "object" && scheduleDate._seconds) {
    // Handle Firestore timestamp
    date = new Date(scheduleDate._seconds * MILLISECONDS_PER_SECOND);
  } else if (typeof scheduleDate === "string") {
    // Handle ISO string or regular date string
    date = new Date(scheduleDate);
  } else {
    return null;
  }

  if (isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Normalizes a schedule date into a standardized format
 * @param scheduleDate - Firestore timestamp object
 * @returns Date string in the format "YYYY-MM-DD" or null if invalid
 */
export const normalizeDate = (scheduleDate: any) => {
  if (!scheduleDate) return null;

  if (typeof scheduleDate === "object" && scheduleDate._seconds) {
    const date = new Date(scheduleDate._seconds * MILLISECONDS_PER_SECOND);
    if (isNaN(date.getTime())) {
      return null;
    }
    return format(date, "yyyy-MM-dd");
  }

  return null;
};
