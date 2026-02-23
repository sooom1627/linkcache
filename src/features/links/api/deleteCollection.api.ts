import { supabase } from "@/src/shared/lib/supabase";

/**
 * コレクションを削除する
 *
 * collections テーブルから指定 ID のレコードを DELETE します。
 * RLS により認証ユーザーが所有するコレクションのみ削除対象となる。
 * 本クエリでは user_id で明示的に所有者に限定している。
 * FK の ON DELETE CASCADE により、紐づく collection_links はDBが自動削除します。
 *
 * @param id - 削除対象のコレクションID
 * @throws 未認証時、Supabase エラー時
 */
export async function deleteCollection(id: string): Promise<void> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("collections")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }
}
