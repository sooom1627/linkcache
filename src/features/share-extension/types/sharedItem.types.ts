import { z } from "zod";

/**
 * 共有アイテムの Zod スキーマ
 *
 * Share Extension から保存される JSON ファイルの形式を定義します。
 */
export const sharedItemSchema = z.object({
  /** 一意の識別子 (UUID) */
  id: z.string().uuid(),
  /** 共有された URL */
  url: z.string().url(),
  /** 共有された日時 (ISO 8601 形式) */
  createdAt: z.string().datetime(),
});

/**
 * 共有アイテムの型
 *
 * Share Extension が App Group に保存する URL データの形式です。
 */
export type SharedItem = z.infer<typeof sharedItemSchema>;

/**
 * 共有アイテム処理結果
 *
 * 各共有アイテムの処理結果を表します。
 */
export interface ProcessedSharedItemResult {
  /** 処理対象のアイテム */
  item: SharedItem;
  /** 処理成功フラグ */
  success: boolean;
  /** エラーメッセージ (失敗時のみ) */
  error?: string;
}
