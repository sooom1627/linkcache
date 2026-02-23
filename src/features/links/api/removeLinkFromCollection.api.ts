import { supabase } from "@/src/shared/lib/supabase";

export interface RemoveLinkFromCollectionParams {
  collectionId: string;
  linkId: string;
}

/**
 * リンクをコレクションから削除する
 *
 * collection_links テーブルから該当レコードを delete する。
 * 存在しないレコードの削除時はエラーにならず、影響行数0で完了する。
 *
 * @param params - collectionId, linkId
 * @throws 未認証時、Supabase エラー時
 */
export async function removeLinkFromCollection(
  params: RemoveLinkFromCollectionParams,
): Promise<void> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("collection_links")
    .delete()
    .eq("collection_id", params.collectionId)
    .eq("link_id", params.linkId);

  if (error) throw error;
}
