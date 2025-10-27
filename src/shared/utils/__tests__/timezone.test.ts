/**
 * Timezone Utility Tests - Level 1: Unit Tests
 * 各関数の基本動作を確認
 */

import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatTime,
  getDeviceTimezone,
  toUTC,
} from "../timezone";

describe("Timezone Utility - Level 1: Basic Unit Tests", () => {
  // テスト用の固定UTC文字列
  const TEST_UTC_STRING = "2025-10-27T12:00:00.000Z";
  const TEST_DATE = new Date(TEST_UTC_STRING);

  describe("getDeviceTimezone", () => {
    it("should return a valid IANA timezone string", () => {
      const timezone = getDeviceTimezone();

      expect(timezone).toBeTruthy();
      expect(typeof timezone).toBe("string");
      // IANA timezone format: "Area/Location" (例: "Asia/Tokyo")
      expect(timezone).toMatch(/^[A-Za-z_]+\/[A-Za-z_]+$/);
    });

    it("should return consistent value on multiple calls", () => {
      const tz1 = getDeviceTimezone();
      const tz2 = getDeviceTimezone();

      expect(tz1).toBe(tz2);
    });
  });

  describe("formatDateTime", () => {
    it("should format UTC string to datetime string", () => {
      const result = formatDateTime(TEST_UTC_STRING);

      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
      expect(result).not.toBe("Invalid Date");
    });

    it("should handle Date object input", () => {
      const result = formatDateTime(TEST_DATE);

      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
      expect(result).not.toBe("Invalid Date");
    });

    it("should respect dateStyle option", () => {
      const short = formatDateTime(TEST_UTC_STRING, { dateStyle: "short" });
      const long = formatDateTime(TEST_UTC_STRING, { dateStyle: "long" });

      expect(short).toBeTruthy();
      expect(long).toBeTruthy();
      // 長さが異なることを確認（詳細なフォーマットはロケール依存）
      expect(short.length).not.toBe(long.length);
    });

    it("should handle invalid date gracefully", () => {
      const result = formatDateTime("invalid-date");

      expect(result).toBe("Invalid Date");
    });
  });

  describe("formatDate", () => {
    it("should format UTC string to date-only string", () => {
      const result = formatDate(TEST_UTC_STRING);

      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
      expect(result).not.toBe("Invalid Date");
    });

    it("should handle Date object input", () => {
      const result = formatDate(TEST_DATE);

      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });

    it("should handle different styles", () => {
      const short = formatDate(TEST_UTC_STRING, "short");
      const medium = formatDate(TEST_UTC_STRING, "medium");
      const long = formatDate(TEST_UTC_STRING, "long");

      expect(short).toBeTruthy();
      expect(medium).toBeTruthy();
      expect(long).toBeTruthy();
    });

    it("should handle invalid date gracefully", () => {
      const result = formatDate("invalid-date");

      expect(result).toBe("Invalid Date");
    });
  });

  describe("formatTime", () => {
    it("should format UTC string to time-only string", () => {
      const result = formatTime(TEST_UTC_STRING);

      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
      expect(result).not.toBe("Invalid Time");
    });

    it("should handle Date object input", () => {
      const result = formatTime(TEST_DATE);

      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });

    it("should handle different styles", () => {
      const short = formatTime(TEST_UTC_STRING, "short");
      const medium = formatTime(TEST_UTC_STRING, "medium");

      expect(short).toBeTruthy();
      expect(medium).toBeTruthy();
    });

    it("should handle invalid date gracefully", () => {
      const result = formatTime("invalid-date");

      expect(result).toBe("Invalid Time");
    });
  });

  describe("formatRelativeTime", () => {
    it("should format recent time to relative string", () => {
      // 2時間前
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const result = formatRelativeTime(twoHoursAgo.toISOString());

      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
      expect(result).not.toBe("Invalid Date");
      // "2 hours ago" や "2時間前" などを含むことを確認
      expect(result.toLowerCase()).toMatch(/hour|時間/);
    });

    it("should handle Date object input", () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(yesterday);

      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });

    it("should handle future time", () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(tomorrow.toISOString());

      expect(result).toBeTruthy();
      // "in" や "後" を含むことを確認（未来形）
      expect(result).toMatch(/in|後/);
    });

    it("should handle invalid date gracefully", () => {
      const result = formatRelativeTime("invalid-date");

      expect(result).toBe("Invalid Date");
    });
  });

  describe("toUTC", () => {
    it("should convert Date to UTC string", () => {
      const result = toUTC(TEST_DATE);

      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
      // ISO 8601形式でUTC（末尾にZ）
      expect(result).toMatch(/Z$/);
    });

    it("should return ISO 8601 format", () => {
      const result = toUTC(TEST_DATE);

      // ISO 8601: YYYY-MM-DDTHH:mm:ss.sssZ
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it("should match Date.toISOString() output", () => {
      const testDate = new Date();
      const result = toUTC(testDate);

      expect(result).toBe(testDate.toISOString());
    });

    it("should throw error for invalid date", () => {
      const invalidDate = new Date("invalid");

      expect(() => toUTC(invalidDate)).toThrow();
    });
  });
});
