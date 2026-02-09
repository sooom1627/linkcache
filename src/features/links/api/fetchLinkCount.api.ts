import { supabase } from "@/src/shared/lib/supabase";

import {
  getLinkCountResponseSchema,
  type GetLinkCountParams,
  type GetLinkCountResponse,
} from "../types/linkList.types";

/**
 * ユーザーのリンク件数を取得する
 *
 * Supabase RPC `get_user_links_count` を呼び出し、
 * フィルタ条件に一致するリンクの件数を取得します。
 *
 * @param params - 取得パラメータ（オプション）
 * @param params.status - ステータスフィルタ（オプション）
 * @param params.isRead - 既読状態フィルタ（オプション）
 * @returns リンク件数
 * @throws Supabaseエラー（認証エラー、DBエラーなど）
 *
 * @example
 * ```ts
 * // 全リンクの件数を取得
 * const { count } = await fetchLinkCount();
 *
 * // ステータスでフィルタ
 * const { count } = await fetchLinkCount({ status: "read_soon" });
 *
 * // 既読状態でフィルタ
 * const { count } = await fetchLinkCount({ isRead: false });
 * ```
 */
export async function fetchLinkCount(
  params: GetLinkCountParams = {},
): Promise<GetLinkCountResponse> {
  const { status, isRead } = params;

  const response = await supabase.rpc("get_user_links_count", {
    p_status: status ?? null,
    p_is_read: isRead ?? null,
  });

  if (response.error) {
    throw response.error;
  }

  if (response.data === null || response.data === undefined) {
    throw new Error("No data returned from RPC");
  }

  // RPCは直接integerを返すため、オブジェクト形式に変換してからバリデーション
  const countData = { count: response.data as number };

  // Zodスキーマでランタイムバリデーション
  const parseResult = getLinkCountResponseSchema.safeParse(countData);

  if (!parseResult.success) {
    throw new Error(
      `Invalid RPC response format: ${parseResult.error.message}`,
    );
  }

  return parseResult.data;
}
