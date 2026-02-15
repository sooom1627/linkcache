import { z } from "zod";

/**
 * コレクション作成APIのパラメータ
 */
export interface CreateCollectionParams {
  name: string;
  description?: string | null;
  emoji?: string | null;
}

/**
 * コレクション更新APIのパラメータ
 */
export interface UpdateCollectionParams {
  name?: string;
  description?: string | null;
  emoji?: string | null;
}

/**
 * コレクション作成のバリデーションスキーマ
 */
export const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  emoji: z.string().max(10).optional().nullable(),
});

/**
 * コレクション更新のバリデーションスキーマ
 * createCollectionSchema の全フィールドをオプションにしたもの
 */
export const updateCollectionSchema = createCollectionSchema.partial();
