import { supabase } from "@/src/shared/lib/supabase";

import type { CollectionWithCount } from "../types/collections.types";

type CollectionRow = {
  id: string;
  name: string;
  emoji: string | null;
  collection_links?: { count: number }[];
};

/**
 * 指定IDのコレクション詳細を取得する
 *
 * RLS により user_id で自動フィルタされます。
 * itemsCount は collection_links の件数です。
 * 直接URL遷移時や一覧未ロード時のフォールバック用。
 *
 * @param id - コレクションID
 * @returns コレクション詳細（id, name, emoji, itemsCount）
 * @throws 未認証時、Supabase エラー時、存在しないID時
 */
export async function getCollection(id: string): Promise<CollectionWithCount> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("collections")
    .select("*, collection_links(count)")
    .eq("id", id)
    .single<CollectionRow>();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    emoji: data.emoji,
    itemsCount: data.collection_links?.[0]?.count ?? 0,
  };
}
