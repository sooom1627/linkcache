import { z } from "zod";

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
