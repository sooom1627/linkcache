import { z } from "zod";

/**
 * コレクション作成のバリデーションスキーマ
 */
export const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  emoji: z
    .union([z.emoji(), z.literal("")])
    .optional()
    .nullable(),
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

/**
 * コレクション一覧取得のオプション
 */
export type FetchCollectionsParams = {
  /** 取得件数の上限。未指定時は全件 */
  limit?: number;
  /** updated_at の並び順。デフォルトは desc（新しい順） */
  order?: "asc" | "desc";
};

/**
 * コレクション一覧取得APIの戻り値型（UI用）
 * itemsCount は collection_links の件数
 */
export type CollectionWithCount = {
  id: string;
  name: string;
  emoji: string | null;
  itemsCount: number;
};
