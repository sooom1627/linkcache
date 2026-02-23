import { supabase } from "@/src/shared/lib/supabase";

import type { UpdateCollectionParams } from "../types/collections.types";
import type { Collection } from "../types/links.types";

/**
 * コレクションを更新する
 *
 * 認証済みユーザーのコレクションを collections テーブルで UPDATE します。
 * params はすべてオプションのため、変更したいフィールドのみ渡せます。
 *
 * @param args.id - 更新対象のコレクションID
 * @param args.params - 更新パラメータ（name?, emoji?）
 * @returns 更新されたコレクション
 * @throws 未認証時、Supabase エラー時、レコードが見つからない時
 */
export async function updateCollection({
  id,
  params,
}: {
  id: string;
  params: UpdateCollectionParams;
}): Promise<Collection> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  const result = await supabase
    .from("collections")
    .update(params as Record<string, unknown>)
    .eq("id", id)
    .select()
    .single();

  const { data, error } = result as {
    data: Collection | null;
    error: Error | null;
  };

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("No data returned");
  }

  return data;
}
