import { supabase } from "@/src/shared/lib/supabase";

import type {
  CollectionWithCount,
  FetchCollectionsParams,
  UserCollectionRow,
} from "../types/collections.types";
import { userCollectionsSchema } from "../types/collections.types";

/** RPC get_user_collections の期待する戻り値型（型アサーション用） */
type GetUserCollectionsResponse = {
  data: UserCollectionRow[] | null;
  error: { message: string } | null;
};

/**
 * 認証済みユーザーのコレクション一覧を取得する
 *
 * RPC get_user_collections を使用し、items_count 順ソートに対応。
 * RLS により user_id で自動フィルタされます。
 *
 * @param params - オプション（limit, order, orderBy）。未指定時は全件・updated_at 降順
 * @returns コレクション一覧（id, name, emoji, itemsCount）
 * @throws 未認証時、Supabase エラー時、バリデーション失敗時
 */
export async function fetchCollections(
  params?: FetchCollectionsParams,
): Promise<CollectionWithCount[]> {
  const authResponse = await supabase.auth.getUser();

  if (authResponse.error || !authResponse.data.user) {
    throw new Error("Not authenticated");
  }

  const response = (await supabase.rpc("get_user_collections", {
    p_order_by: params?.orderBy ?? "updated_at",
    p_order: params?.order ?? "desc",
    p_limit: params?.limit ?? null,
  })) as GetUserCollectionsResponse;

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (response.data === null) {
    throw new Error("No data returned from RPC");
  }

  const parsed = userCollectionsSchema.safeParse(response.data);
  if (!parsed.success) {
    throw new Error(`Validation failed: ${parsed.error.message}`);
  }

  return parsed.data.map((row) => ({
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    itemsCount: row.items_count,
  }));
}
