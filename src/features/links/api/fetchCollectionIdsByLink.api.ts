import { supabase } from "@/src/shared/lib/supabase";

type CollectionLinkRow = {
  collection_id: string;
};

/**
 * リンクに紐づくコレクションID一覧を取得する
 *
 * collection_links テーブルから link_id で collection_id 一覧を取得する。
 * RLS により認証ユーザーのコレクションに紐づくレコードのみ返却される。
 * 機能9（リンク別コレクション取得）の API 層。useCollectionsForLink から使用される。
 *
 * @param linkId - リンクID
 * @returns collection_id の配列
 * @throws 未認証時、Supabase エラー時
 */
export async function fetchCollectionIdsByLink(
  linkId: string,
): Promise<string[]> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("collection_links")
    .select("collection_id")
    .eq("link_id", linkId);

  if (error) throw error;

  const rows: CollectionLinkRow[] = data ?? [];
  return rows.map((row) => row.collection_id);
}
