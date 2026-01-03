import { supabase } from "@/src/shared/lib/supabase";

import {
  getUserLinksResponseSchema,
  type GetUserLinksParams,
  type GetUserLinksResponse,
} from "../types/linkList.types";

/**
 * ユーザーのリンク一覧を取得する
 *
 * Supabase RPC `get_user_links` を呼び出し、
 * ページング付きでリンク一覧を取得します。
 *
 * @param params - 取得パラメータ
 * @param params.pageSize - 1ページあたりの件数 (デフォルト: 20)
 * @param params.page - ページ番号 (0始まり、デフォルト: 0)
 * @returns ページング情報付きのリンク一覧
 * @throws Supabaseエラー（認証エラー、DBエラーなど）
 *
 * @example
 * ```ts
 * // 最初のページを取得
 * const { data, hasMore, totalCount } = await fetchUserLinks();
 *
 * // 2ページ目を10件ずつ取得
 * const page2 = await fetchUserLinks({ pageSize: 10, page: 1 });
 * ```
 */
export async function fetchUserLinks(
  params: GetUserLinksParams = {},
): Promise<GetUserLinksResponse> {
  const { pageSize = 20, page = 0 } = params;

  const response = await supabase.rpc("get_user_links", {
    p_page_size: pageSize,
    p_page: page,
  });

  if (response.error) {
    throw response.error;
  }

  if (!response.data) {
    throw new Error("No data returned from RPC");
  }

  // Zodスキーマでランタイムバリデーション
  const parseResult = getUserLinksResponseSchema.safeParse(response.data);

  if (!parseResult.success) {
    throw new Error(
      `Invalid RPC response format: ${parseResult.error.message}`,
    );
  }

  return parseResult.data;
}

