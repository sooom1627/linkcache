import { z } from "zod";

import type { Collection } from "./links.types";

/**
 * コレクション作成APIのレスポンス型（emoji を含む）
 * supabase.types の collections に emoji が未定義の場合の拡張
 */
export type CreateCollectionResponse = Collection & { emoji?: string | null };

/**
 * コレクション作成のバリデーションスキーマ
 */
export const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  emoji: z.string().max(10).optional().nullable(),
});

/**
 * コレクション作成APIのパラメータ
 */
export type CreateCollectionParams = z.infer<typeof createCollectionSchema>;

/**
 * コレクション更新のバリデーションスキーマ
 * createCollectionSchema の全フィールドをオプションにしたもの
 */
export const updateCollectionSchema = createCollectionSchema.partial();

/**
 * コレクション更新APIのパラメータ
 */
export type UpdateCollectionParams = z.infer<typeof updateCollectionSchema>;
