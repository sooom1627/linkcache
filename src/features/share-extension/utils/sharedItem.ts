import { sharedItemSchema, type SharedItem } from "../types/sharedItem.types";

/**
 * SharedItem を検証する
 *
 * @param data 検証対象のデータ
 * @returns Zod の検証結果
 */
export function validateSharedItem(data: unknown) {
  return sharedItemSchema.safeParse(data);
}

/**
 * データが有効な SharedItem かどうかを判定する
 *
 * @param data 検証対象のデータ
 * @returns 有効な SharedItem なら true
 */
export function isValidSharedItem(data: unknown): data is SharedItem {
  return validateSharedItem(data).success;
}

/**
 * JSON 文字列を SharedItem にパースする
 *
 * @param jsonString JSON 文字列
 * @returns パース成功時は SharedItem、失敗時は null
 */
export function parseSharedItem(jsonString: string): SharedItem | null {
  if (!jsonString) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(jsonString);
    const result = validateSharedItem(parsed);

    if (result.success) {
      return result.data;
    }

    return null;
  } catch {
    return null;
  }
}
