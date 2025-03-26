import {
  calculateTotalSeconds,
  formatDuration,
  formatTimeValue,
  MAX_SECONDS,
  parseTimeValue,
  secondsToTime,
} from "../timeUtils";

describe("timeUtils", () => {
  describe("parseTimeValue", () => {
    it("parses valid string numbers correctly", () => {
      expect(parseTimeValue("123", 1000)).toBe(123);
      expect(parseTimeValue("0", 1000)).toBe(0);
    });

    it("returns 0 for invalid input", () => {
      expect(parseTimeValue("", 1000)).toBe(0);
      expect(parseTimeValue("abc", 1000)).toBe(0);
      expect(parseTimeValue("12.34", 1000)).toBe(0);
    });

    it("caps the value at the maximum", () => {
      expect(parseTimeValue("1500", 1000)).toBe(1000);
      expect(parseTimeValue("2000", 1000)).toBe(1000);
    });
  });

  describe("formatTimeValue", () => {
    it("formats positive numbers correctly", () => {
      expect(formatTimeValue(123)).toBe("123");
      expect(formatTimeValue(1)).toBe("1");
    });

    it("returns empty string for zero or negative numbers", () => {
      expect(formatTimeValue(0)).toBe("");
      expect(formatTimeValue(-1)).toBe("");
    });
  });

  describe("calculateTotalSeconds", () => {
    it("calculates total seconds correctly", () => {
      expect(calculateTotalSeconds(1, 30, 45)).toBe(5445); // 1h 30m 45s
      expect(calculateTotalSeconds(0, 5, 30)).toBe(330); // 5m 30s
    });

    it("caps the total at MAX_SECONDS", () => {
      expect(calculateTotalSeconds(4, 0, 0)).toBe(MAX_SECONDS); // 4h > 3h max
      expect(calculateTotalSeconds(3, 1, 0)).toBe(MAX_SECONDS); // 3h 1m > 3h max
    });
  });

  describe("secondsToTime", () => {
    it("converts seconds to hours, minutes, and seconds correctly", () => {
      expect(secondsToTime(5445)).toEqual({
        hours: 1,
        minutes: 30,
        seconds: 45,
      });
      expect(secondsToTime(330)).toEqual({ hours: 0, minutes: 5, seconds: 30 });
      expect(secondsToTime(3600)).toEqual({ hours: 1, minutes: 0, seconds: 0 });
    });

    it("handles zero seconds correctly", () => {
      expect(secondsToTime(0)).toEqual({ hours: 0, minutes: 0, seconds: 0 });
    });
  });

  describe("formatDuration", () => {
    it("formats duration with hours and minutes", () => {
      expect(formatDuration(5400)).toBe("1h 30m"); // 1h 30m
    });

    it("formats duration with minutes and seconds", () => {
      expect(formatDuration(185)).toBe("3m 5s"); // 3m 5s
    });

    it("formats duration with only seconds when less than a minute", () => {
      expect(formatDuration(45)).toBe("45s");
    });

    it("formats zero duration", () => {
      expect(formatDuration(0)).toBe("0s");
    });

    it("formats duration with only hours", () => {
      expect(formatDuration(3600)).toBe("1h");
    });

    it("formats duration with only minutes", () => {
      expect(formatDuration(1800)).toBe("30m");
    });
  });
});
