import { supabase } from "@/src/shared/lib/supabase";

import type {
  CollectionWithCount,
  FetchCollectionsParams,
} from "../types/collections.types";

type CollectionRow = {
  id: string;
  name: string;
  emoji: string | null;
  collection_links?: { count: number }[];
};

/**
 * 認証済みユーザーのコレクション一覧を取得する
 *
 * RLS により user_id で自動フィルタされます。
 * itemsCount は collection_links の件数です。
 *
 * @param params - オプション（limit, order）。未指定時は全件・updated_at 降順
 * @returns コレクション一覧（id, name, emoji, itemsCount）
 * @throws 未認証時、Supabase エラー時
 */
export async function fetchCollections(
  params?: FetchCollectionsParams,
): Promise<CollectionWithCount[]> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  let query = supabase
    .from("collections")
    .select("*, collection_links(count)")
    .order("updated_at", {
      ascending: params?.order === "asc",
    });

  if (params?.limit != null) {
    query = query.limit(params.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as CollectionRow[];

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    itemsCount: row.collection_links?.[0]?.count ?? 0,
  }));
}
