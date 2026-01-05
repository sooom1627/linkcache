import { supabase } from "@/src/shared/lib/supabase";

/**
 * 指定されたlink_idのリンクを削除する
 *
 * link_statusテーブルからユーザー固有のリンクステータスを削除します。
 * RLSポリシーにより、現在のユーザーが所有するリンクのみが削除されます。
 *
 * @param linkId - 削除するリンクのID
 * @throws Supabaseエラー（認証エラー、DBエラーなど）
 *
 * @example
 * ```ts
 * await deleteLinkById("123e4567-e89b-12d3-a456-426614174000");
 * ```
 */
export async function deleteLinkById(linkId: string): Promise<void> {
  const { error } = await supabase
    .from("link_status")
    .delete()
    .eq("link_id", linkId);

  if (error) {
    throw new Error(`Failed to delete link: ${error.message}`);
  }
}
