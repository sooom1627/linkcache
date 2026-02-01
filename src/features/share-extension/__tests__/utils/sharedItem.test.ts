import type { SharedItem } from "../../types/sharedItem.types";
import {
  isValidSharedItem,
  parseSharedItem,
  validateSharedItem,
} from "../../utils/sharedItem";

describe("sharedItem utils", () => {
  const validItem: SharedItem = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    url: "https://example.com/article",
    createdAt: "2024-01-15T10:30:00.000Z",
  };

  describe("validateSharedItem", () => {
    it("有効な SharedItem を検証できる", () => {
      const result = validateSharedItem(validItem);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validItem);
      }
    });

    it("無効な UUID を拒否する", () => {
      const invalidItem = { ...validItem, id: "invalid-uuid" };
      const result = validateSharedItem(invalidItem);
      expect(result.success).toBe(false);
    });

    it("無効な URL を拒否する", () => {
      const invalidItem = { ...validItem, url: "not-a-url" };
      const result = validateSharedItem(invalidItem);
      expect(result.success).toBe(false);
    });

    it("無効な日時形式を拒否する", () => {
      const invalidItem = { ...validItem, createdAt: "invalid-date" };
      const result = validateSharedItem(invalidItem);
      expect(result.success).toBe(false);
    });

    it("必須フィールドが欠けている場合を拒否する", () => {
      const incompleteItem = { id: validItem.id, url: validItem.url };
      const result = validateSharedItem(incompleteItem);
      expect(result.success).toBe(false);
    });

    it("null を拒否する", () => {
      const result = validateSharedItem(null);
      expect(result.success).toBe(false);
    });

    it("undefined を拒否する", () => {
      const result = validateSharedItem(undefined);
      expect(result.success).toBe(false);
    });
  });

  describe("isValidSharedItem", () => {
    it("有効な SharedItem に対して true を返す", () => {
      expect(isValidSharedItem(validItem)).toBe(true);
    });

    it("無効なデータに対して false を返す", () => {
      expect(isValidSharedItem({ invalid: "data" })).toBe(false);
    });

    it("null に対して false を返す", () => {
      expect(isValidSharedItem(null)).toBe(false);
    });
  });

  describe("parseSharedItem", () => {
    it("有効な JSON 文字列をパースできる", () => {
      const jsonString = JSON.stringify(validItem);
      const result = parseSharedItem(jsonString);
      expect(result).toEqual(validItem);
    });

    it("無効な JSON 文字列に対して null を返す", () => {
      const result = parseSharedItem("invalid json {");
      expect(result).toBeNull();
    });

    it("JSON として有効だが SharedItem として無効な場合 null を返す", () => {
      const result = parseSharedItem('{"invalid": "data"}');
      expect(result).toBeNull();
    });

    it("空文字列に対して null を返す", () => {
      const result = parseSharedItem("");
      expect(result).toBeNull();
    });

    it("余分なフィールドがあっても有効なデータはパースできる", () => {
      const itemWithExtra = { ...validItem, extraField: "value" };
      const jsonString = JSON.stringify(itemWithExtra);
      const result = parseSharedItem(jsonString);
      expect(result).not.toBeNull();
      expect(result?.id).toBe(validItem.id);
      expect(result?.url).toBe(validItem.url);
    });
  });
});
