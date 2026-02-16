import { supabase } from "@/src/shared/lib/supabase";

import type { CollectionWithCount } from "../types/collections.types";

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
 * @returns コレクション一覧（id, name, emoji, itemsCount）
 * @throws 未認証時、Supabase エラー時
 */
export async function fetchCollections(): Promise<CollectionWithCount[]> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("collections")
    .select("*, collection_links(count)");

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
