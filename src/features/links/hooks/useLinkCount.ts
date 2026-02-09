import { useQuery } from "@tanstack/react-query";

import { fetchLinkCount } from "../api/fetchLinkCount.api";
import { linkQueryKeys } from "../constants/queryKeys";
import type { GetLinkCountParams } from "../types/linkList.types";

/**
 * useLinkCount フックのオプション
 */
export interface UseLinkCountOptions extends GetLinkCountParams {}

/**
 * useLinkCount フックの戻り値
 */
export interface UseLinkCountReturn {
  /** リンク件数 */
  data: { count: number } | undefined;
  /** ローディング中か */
  isLoading: boolean;
  /** エラーが発生したか */
  isError: boolean;
  /** エラー情報 */
  error: Error | null;
  /** データを再取得する関数 */
  refetch: () => void;
}

/**
 * ユーザーのリンク件数を取得するフック
 *
 * フィルタ条件に一致するリンクの件数を取得します。
 * キャッシュ戦略は既存設定と統一（30分staleTime、60分gcTime）しています。
 *
 * @param options - フィルタオプション（status, isRead）
 * @returns リンク件数とローディング・エラー状態
 *
 * @example
 * ```tsx
 * // 全リンクの件数を取得
 * const { data, isLoading } = useLinkCount();
 *
 * // ステータスでフィルタ
 * const { data } = useLinkCount({ status: "read_soon" });
 *
 * // 既読状態でフィルタ
 * const { data } = useLinkCount({ isRead: false });
 * ```
 */
export function useLinkCount(
  options: UseLinkCountOptions = {},
): UseLinkCountReturn {
  const { status, isRead } = options;

  // フィルタパラメータ（クエリキー用）
  const filterParams: GetLinkCountParams = {
    ...(status !== undefined && { status }),
    ...(isRead !== undefined && { isRead }),
  };

  const query = useQuery({
    queryKey: linkQueryKeys.count(
      Object.keys(filterParams).length > 0 ? filterParams : undefined,
    ),
    queryFn: () => fetchLinkCount(filterParams),
    staleTime: 30 * 60 * 1000, // 30分: 既存設定と統一
    gcTime: 60 * 60 * 1000, // 60分: 既存設定と統一
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: () => void query.refetch(),
  };
}
