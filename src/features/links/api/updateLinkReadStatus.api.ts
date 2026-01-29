import { supabase } from "@/src/shared/lib/supabase";

import type { TriageStatus } from "../types";

/**
 * リンクの既読状態を更新する
 *
 * link_statusテーブルのread_atカラムとstatusカラムを更新します。
 * - 既読時: read_atを現在のタイムスタンプ（ISO 8601形式）に設定
 * - 未読時: read_atをnullに設定
 * - status: オプションでステータスを同時に更新可能（指定しない場合は既存の値が保持される、nullを明示的に指定した場合はnullに更新）
 *
 * RLSポリシーにより、現在のユーザーが所有するリンクのみが更新されます。
 *
 * @param linkId - 更新するリンクのID（UUID形式）
 * @param isRead - 既読にする場合はtrue、未読にする場合はfalse
 * @param status - ステータスを更新する場合の新しいステータス値（オプション）
 * @throws Error - Supabaseエラーが発生した場合（認証エラー、DBエラーなど）
 *
 * @example
 * ```ts
 * // 既読にする（ステータスは変更しない）
 * await updateLinkReadStatus("123e4567-e89b-12d3-a456-426614174000", true);
 *
 * // 既読にしてステータスをdoneに更新
 * await updateLinkReadStatus("123e4567-e89b-12d3-a456-426614174000", true, "done");
 *
 * // 未読にする（ステータスは変更しない）
 * await updateLinkReadStatus("123e4567-e89b-12d3-a456-426614174000", false);
 *
 * // 未読にしてステータスをread_soonに更新
 * await updateLinkReadStatus("123e4567-e89b-12d3-a456-426614174000", false, "read_soon");
 * ```
 */
export async function updateLinkReadStatus(
  linkId: string,
  isRead: boolean,
  status?: TriageStatus | null,
): Promise<void> {
  const updatePayload: {
    read_at: string | null;
    status?: TriageStatus | null;
  } = {
    read_at: isRead ? new Date().toISOString() : null,
  };

  // statusが明示的に提供された場合のみ、更新ペイロードに含める
  if (status !== undefined) {
    updatePayload.status = status;
  }

  const { error } = await supabase
    .from("link_status")
    .update(updatePayload)
    .eq("link_id", linkId);

  if (error) {
    throw new Error(`Failed to update link read status: ${error.message}`);
  }
}
