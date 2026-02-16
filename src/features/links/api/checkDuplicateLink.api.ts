import { supabase } from "@/src/shared/lib/supabase";

/**
 * 指定URLが既にユーザーのリンクに存在するかチェックする
 *
 * user_links_view を使用して、現在のユーザーが既に同じURLを保存しているか確認します。
 *
 * @param url - 正規化済みのURL
 * @returns 重複が存在する場合は true
 */
export async function checkDuplicateLink(url: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_links_view")
    .select("link_id")
    .eq("url", url)
    .limit(1);

  if (error) {
    // チェック失敗時は重複なしとして続行（保存を妨げない）
    console.warn("Duplicate check failed:", error.message);
    return false;
  }

  return (data?.length ?? 0) > 0;
}
