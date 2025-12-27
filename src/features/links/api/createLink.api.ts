import { supabase } from "@/src/shared/lib/supabase";

/**
 * リンク作成APIのパラメータ
 */
export interface CreateLinkParams {
  url: string;
  title?: string | null;
  description?: string | null;
  image_url?: string | null;
  favicon_url?: string | null;
  site_name?: string | null;
}

/**
 * リンク作成APIのレスポンス
 */
export interface CreateLinkResponse {
  link_id: string;
  url: string;
  status: "inbox" | "keep" | "archived" | "dismissed";
}

/**
 * リンクを作成してステータスを設定する
 *
 * Supabase RPC `create_link_with_status` を呼び出し、
 * linksテーブルとlink_statusテーブルにデータを作成します。
 *
 * @param params - リンク作成パラメータ
 * @returns 作成されたリンク情報
 * @throws Supabaseエラー（認証エラー、DBエラーなど）
 */
export async function createLinkWithStatus(
  params: CreateLinkParams,
): Promise<CreateLinkResponse> {
  // Supabase RPC の戻り値型は Database.Functions に定義がないため any になる
  // 型安全性は CreateLinkResponse で保証
  const response = await supabase.rpc("create_link_with_status", {
    p_url: params.url,
    p_title: params.title ?? null,
    p_description: params.description ?? null,
    p_image_url: params.image_url ?? null,
    p_favicon_url: params.favicon_url ?? null,
    p_site_name: params.site_name ?? null,
  });

  if (response.error) {
    throw response.error;
  }

  if (!response.data) {
    throw new Error("No data returned from RPC");
  }

  return response.data as CreateLinkResponse;
}
