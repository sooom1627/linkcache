import { supabase } from "@/src/shared/lib/supabase";

/**
 * コレクションを削除する
 *
 * ON DELETE CASCADE により collection_links も自動削除される。
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

  const { error } = await supabase.from("collections").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
