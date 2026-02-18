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
