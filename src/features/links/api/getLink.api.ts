import { supabase } from "@/src/shared/lib/supabase";

import { userLinkSchema, type UserLink } from "../types/linkList.types";
import type { Tables } from "../types/supabase.types";

type UserLinksViewRow = Tables<"user_links_view">;

/**
 * 指定されたlink_idのリンク詳細を取得する
 *
 * RLSポリシーにより、現在のユーザーが所有するリンクのみが取得されます。
 * view経由でもベーステーブル（link_status）のRLSポリシーが適用されます。
 *
 * @param linkId - 取得するリンクのID
 * @returns リンク詳細データ
 * @throws Supabaseエラーまたはデータが見つからない場合
 *
 * @example
 * ```ts
 * const link = await getLinkById("123e4567-e89b-12d3-a456-426614174000");
 * console.log(link.title);
 * ```
 */
export async function getLinkById(linkId: string): Promise<UserLink> {
  const { data, error } = await supabase
    .from("user_links_view")
    .select("*")
    .eq("link_id", linkId)
    .single<UserLinksViewRow>();

  if (error) {
    throw new Error(`Failed to fetch link: ${error.message}`);
  }

  if (!data) {
    throw new Error("Link not found");
  }

  // Zodスキーマでランタイムバリデーション
  return userLinkSchema.parse(data);
}
