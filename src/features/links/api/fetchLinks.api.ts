import { supabase } from "@/src/shared/lib/supabase";

import {
  getUserLinksResponseSchema,
  orderBySchema,
  type GetUserLinksParams,
  type GetUserLinksResponse,
} from "../types/linkList.types";

/**
 * ユーザーのリンク一覧を取得する
 *
 * Supabase RPC `get_user_links` を呼び出し、
 * ページング付きでリンク一覧を取得します。
 * collectionId を指定すると、そのコレクション内のリンクのみに絞り込みます。
 *
 * @param params - 取得パラメータ
 * @param params.pageSize - 1ページあたりの件数 (デフォルト: 20)
 * @param params.page - ページ番号 (0始まり、デフォルト: 0)
 * @param params.status - ステータスフィルタ
 * @param params.isRead - 既読状態フィルタ
 * @param params.limit - 件数制限（ページング無視）
 * @param params.orderBy - ソート順（triaged_at_asc | created_at_desc | null。null 時は link_status.created_at 降順）
 * @param params.collectionId - コレクションIDでフィルタ（指定時はそのコレクション内のリンクのみ）
 * @param params.uncollectedOnly - コレクション未所属リンクのみ取得
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
 *
 * // コレクション内のリンクを取得
 * const collectionLinks = await fetchUserLinks({ collectionId: "col-123" });
 * ```
 */
export async function fetchUserLinks(
  params: GetUserLinksParams = {},
): Promise<GetUserLinksResponse> {
  const {
    pageSize = 20,
    page = 0,
    status,
    isRead,
    limit,
    orderBy,
    collectionId,
    uncollectedOnly = false,
  } = params;

  // orderBy を許可リストで検証
  const validatedOrderBy = orderBySchema.parse(orderBy ?? null);

  if (collectionId != null && uncollectedOnly) {
    throw new Error("collectionId and uncollectedOnly cannot be used together");
  }

  const response = await supabase.rpc("get_user_links", {
    p_page_size: pageSize,
    p_page: page,
    p_status: status ?? null,
    p_is_read: isRead ?? null,
    p_limit: limit ?? null,
    p_order_by: validatedOrderBy,
    p_collection_id: collectionId ?? null,
    p_uncollected_only: uncollectedOnly,
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
