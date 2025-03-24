import { format } from "date-fns";

export const formatScheduleDate = (scheduleDate: any) => {
  if (!scheduleDate) return null;

  let date;
  if (typeof scheduleDate === "object" && scheduleDate._seconds) {
    // Handle Firestore timestamp
    date = new Date(scheduleDate._seconds * 1000);
  } else if (typeof scheduleDate === "string") {
    // Handle ISO string or regular date string
    date = new Date(scheduleDate);
  } else {
    return null;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const normalizeDate = (scheduleDate: any) => {
  if (!scheduleDate) return null;

  if (typeof scheduleDate === "object" && scheduleDate._seconds) {
    return format(new Date(scheduleDate._seconds * 1000), "yyyy-MM-dd");
  }

  return null;
};
