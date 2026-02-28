import { supabase } from "@/src/shared/lib/supabase";

/**
 * 指定されたlink_idのリンクを削除する
 *
 * RPC関数 delete_user_link を呼び出し、link_status と collection_links を
 * 単一トランザクションで削除します。
 * SECURITY INVOKER により、RLSポリシーが適用されます。
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
  const { error } = await supabase.rpc("delete_user_link", {
    p_link_id: linkId,
  });

  if (error) {
    throw new Error(`Failed to delete link: ${error.message}`);
  }
}
