import { formatScheduleDate, normalizeDate } from "../dateUtils";

describe("dateUtils", () => {
  describe("formatScheduleDate", () => {
    it("returns null when no date is provided", () => {
      expect(formatScheduleDate(null)).toBeNull();
      expect(formatScheduleDate(undefined)).toBeNull();
    });

    it("formats Firestore timestamp correctly", () => {
      const firestoreTimestamp = {
        _seconds: 1711238400, // March 23, 2024 UTC
      };
      const result = formatScheduleDate(firestoreTimestamp);
      // The date will be displayed in local timezone
      expect(result).toMatch(/March (23|24), 2024/);
    });

    it("formats ISO string correctly", () => {
      const isoString = "2024-03-23T00:00:00.000Z";
      const result = formatScheduleDate(isoString);
      // The date will be displayed in local timezone
      expect(result).toMatch(/March (23|24), 2024/);
    });

    it("returns null for invalid date format", () => {
      expect(formatScheduleDate("invalid-date")).toBeNull();
      expect(formatScheduleDate({})).toBeNull();
      expect(formatScheduleDate(123)).toBeNull();
      expect(formatScheduleDate("")).toBeNull();
    });
  });

  describe("normalizeDate", () => {
    it("returns null when no date is provided", () => {
      expect(normalizeDate(null)).toBeNull();
      expect(normalizeDate(undefined)).toBeNull();
    });

    it("normalizes Firestore timestamp correctly", () => {
      const firestoreTimestamp = {
        _seconds: 1711238400, // March 23, 2024 UTC
      };
      const result = normalizeDate(firestoreTimestamp);
      // The date will be normalized to UTC date
      expect(result).toMatch(/2024-03-(23|24)/);
    });

    it("returns null for invalid date format", () => {
      expect(normalizeDate("2024-03-23")).toBeNull();
      expect(normalizeDate({})).toBeNull();
      expect(normalizeDate(123)).toBeNull();
      expect(normalizeDate("")).toBeNull();
    });
  });
});
