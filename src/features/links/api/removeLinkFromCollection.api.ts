import { supabase } from "@/src/shared/lib/supabase";

/**
 * リンクをコレクションから削除する際のパラメータ
 */
export interface RemoveLinkFromCollectionParams {
  /** コレクションID */
  collectionId: string;
  /** リンクID */
  linkId: string;
}

/**
 * リンクをコレクションから削除する
 *
 * collection_links テーブルから該当レコードを delete する。
 * 存在しないレコードの削除時はエラーにならず、影響行数0で完了する。
 *
 * @param params - collectionId, linkId
 * @returns Promise<void> 成功時は何も返さない
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

  if (error) {
    throw new Error(error.message ?? "Failed to remove link from collection");
  }
}
