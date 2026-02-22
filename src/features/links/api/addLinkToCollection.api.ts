import { supabase } from "@/src/shared/lib/supabase";

import type { CollectionLink } from "../types/links.types";

export interface AddLinkToCollectionParams {
  collectionId: string;
  linkId: string;
}

/**
 * リンクをコレクションに追加する
 *
 * collection_links テーブルに insert する。
 * 重複追加時はユニーク制約エラー（23505）が発生する。
 *
 * @param params - collectionId, linkId
 * @returns 作成された CollectionLink
 * @throws 未認証時、Supabase エラー時
 */
export async function addLinkToCollection(
  params: AddLinkToCollectionParams,
): Promise<CollectionLink> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("collection_links")
    .insert({
      collection_id: params.collectionId,
      link_id: params.linkId,
    })
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error("No data returned");

  return data as CollectionLink;
}
