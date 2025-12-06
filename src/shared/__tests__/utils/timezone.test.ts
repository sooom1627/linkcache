import {
  formatDate,
  formatDateTime,
  formatMonthDay,
  formatRelativeTime,
  formatTime,
  getDeviceTimezone,
  toUTC,
} from "../../utils/timezone";

describe("timezone utils", () => {
  // Save original Intl
  const originalIntl = global.Intl;

  beforeAll(() => {
    // Mock timezone to a fixed one (e.g., JST) for consistent testing if needed
  });

  afterAll(() => {
    global.Intl = originalIntl;
  });

  describe("getDeviceTimezone", () => {
    it("returns a string", () => {
      expect(typeof getDeviceTimezone()).toBe("string");
    });
  });

  describe("formatDateTime", () => {
    const testDate = new Date("2023-10-27T10:00:00Z"); // UTC

    it("formats correctly with default options", () => {
      expect(typeof formatDateTime(testDate)).toBe("string");
    });

    it("formats correctly with specific locale (en-US)", () => {
      const result = formatDateTime(testDate, { locale: "en-US" });
      expect(result).toContain("2023");
    });

    it("handles invalid dates gracefully", () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      expect(formatDateTime("invalid-date")).toBe("Invalid Date");
      consoleSpy.mockRestore();
    });
  });

  describe("formatDate", () => {
    const testDate = new Date("2023-10-27T10:00:00Z");

    it("formats correctly with specific locale", () => {
      const result = formatDate(testDate, "medium", "en-US");
      expect(result).toContain("Oct");
      expect(result).toContain("27");
      expect(result).toContain("2023");
    });

    it("handles invalid dates", () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      expect(formatDate("invalid")).toBe("Invalid Date");
      consoleSpy.mockRestore();
    });
  });

  describe("formatTime", () => {
    const testDate = new Date("2023-10-27T10:00:00Z");

    it("formats correctly with specific locale", () => {
      const result = formatTime(testDate, "short", "en-US");
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it("handles invalid dates", () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      expect(formatTime("invalid")).toBe("Invalid Time");
      consoleSpy.mockRestore();
    });
  });

  describe("formatRelativeTime", () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    it("formats relative time correctly (1 hour ago)", () => {
      const result = formatRelativeTime(oneHourAgo, { locale: "en-US" });
      expect(result).toBe("1 hour ago");
    });

    it("formats relative time correctly (1 day ago)", () => {
      const result = formatRelativeTime(oneDayAgo, { locale: "en-US" });
      // numeric: 'auto' produces "yesterday" for -1 day
      expect(result).toBe("yesterday");
    });

    it("handles invalid dates", () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      expect(formatRelativeTime("invalid")).toBe("Invalid Date");
      consoleSpy.mockRestore();
    });
  });

  describe("formatMonthDay", () => {
    const testDate = new Date("2023-10-27T10:00:00Z");

    it("formats correctly", () => {
      const result = formatMonthDay(testDate, "en-US");
      expect(result).toContain("October");
      expect(result).toContain("27");
    });
  });

  describe("toUTC", () => {
    it("converts date to ISO string", () => {
      const date = new Date(2023, 9, 27, 10, 0, 0); // Local time
      const result = toUTC(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it("throws on invalid date", () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      expect(() => toUTC(new Date("invalid"))).toThrow(
        "Failed to convert date to UTC",
      );
      consoleSpy.mockRestore();
    });
  });
});
