import { z } from "zod";

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
 * リンク作成APIレスポンスのZodスキーマ
 *
 * Supabase RPC `create_link_with_status` の戻り値を検証
 * - link_id: UUID形式の文字列
 * - url: 有効なURL文字列
 * - status: リンクステータス列挙値
 */
const createLinkResponseSchema = z.object({
  link_id: z.string().uuid(),
  url: z.string().url(),
  status: z.enum(["inbox", "read_soon", "later"]),
});

/**
 * リンク作成APIのレスポンス型（Zodスキーマから推論）
 */
export type CreateLinkResponse = z.infer<typeof createLinkResponseSchema>;

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

  // Zodスキーマでランタイムバリデーション
  const parseResult = createLinkResponseSchema.safeParse(response.data);

  if (!parseResult.success) {
    throw new Error(
      `Invalid RPC response format: ${parseResult.error.message}`,
    );
  }

  return parseResult.data;
}
