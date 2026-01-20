import { supabase } from "@/src/shared/lib/supabase";

import type { TriageStatus } from "../types/linkList.types";

/**
 * リンクのトリアージステータスを更新する
 *
 * link_statusテーブルのstatusとtriaged_atを更新します。
 *
 * @param linkId - 更新するリンクのID（link_statusのlink_id）
 * @param status - 新しいトリアージステータス（inbox | read_soon | later）
 * @throws Error - Supabaseエラーが発生した場合
 *
 * @example
 * ```ts
 * // Read Soonに更新
 * await updateLinkStatus("123e4567-e89b-12d3-a456-426614174000", "read_soon");
 *
 * // Laterに更新
 * await updateLinkStatus("123e4567-e89b-12d3-a456-426614174000", "later");
 * ```
 */
export async function updateLinkStatus(
  linkId: string,
  status: TriageStatus,
): Promise<void> {
  const { error } = await supabase
    .from("link_status")
    .update({
      status,
      triaged_at: new Date().toISOString(),
    })
    .eq("link_id", linkId);

  if (error) {
    throw new Error(`Failed to update link status: ${error.message}`);
  }
}
