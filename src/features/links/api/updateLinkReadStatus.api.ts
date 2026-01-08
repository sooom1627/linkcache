import { supabase } from "@/src/shared/lib/supabase";

/**
 * リンクの既読状態を更新する
 *
 * link_statusテーブルのread_atカラムを更新します。
 * - 既読時: read_atを現在のタイムスタンプ（ISO 8601形式）に設定
 * - 未読時: read_atをnullに設定
 *
 * RLSポリシーにより、現在のユーザーが所有するリンクのみが更新されます。
 *
 * @param linkId - 更新するリンクのID（UUID形式）
 * @param isRead - 既読にする場合はtrue、未読にする場合はfalse
 * @throws Error - Supabaseエラーが発生した場合（認証エラー、DBエラーなど）
 *
 * @example
 * ```ts
 * // 既読にする
 * await updateLinkReadStatus("123e4567-e89b-12d3-a456-426614174000", true);
 *
 * // 未読にする
 * await updateLinkReadStatus("123e4567-e89b-12d3-a456-426614174000", false);
 * ```
 */
export async function updateLinkReadStatus(
  linkId: string,
  isRead: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("link_status")
    .update({
      read_at: isRead ? new Date().toISOString() : null,
    })
    .eq("link_id", linkId);

  if (error) {
    throw new Error(`Failed to update link read status: ${error.message}`);
  }
}
