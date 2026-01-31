import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { dataHelpers } from "@/src/shared/utils/timezone";

import { fetchUserLinks } from "../api/fetchLinks.api";
import { linkQueryKeys } from "../constants/queryKeys";
import type { LinkFilterParams, UserLink } from "../types/linkList.types";

/** デフォルトのページサイズ */
const DEFAULT_PAGE_SIZE = 20;

/**
 * useLinks フックのオプション
 */
export interface UseLinksOptions extends LinkFilterParams {
  /** 1ページあたりの件数 (デフォルト: 20) */
  pageSize?: number;
}

/**
 * useLinks フックの戻り値
 */
export interface UseLinksReturn {
  /** フラット化されたリンク一覧 */
  links: UserLink[];
  /** 初回ローディング中か */
  isLoading: boolean;
  /** 次ページ取得中か */
  isFetchingNextPage: boolean;
  /** エラーが発生したか */
  isError: boolean;
  /** エラー情報 */
  error: Error | null;
  /** 次のページが存在するか */
  hasNextPage: boolean;
  /** 総件数 */
  totalCount: number;
  /** 次のページを取得する関数 */
  fetchNextPage: () => void;
  /** データを再取得する関数 */
  refetch: () => void;
  /** リフレッシュ中か（pull-to-refresh用） */
  isRefreshing: boolean;
}

/**
 * ユーザーのリンク一覧を取得するフック
 *
 * 無限スクロール対応のページング処理を提供します。
 * limit を指定した場合は単一ページ取得（無限スクロール無効）になります。
 *
 * @param options - フィルタオプション（status, isRead, limit, pageSize）
 * @returns リンク一覧とページング関連の状態・関数
 *
 * @example
 * ```tsx
 * // 無限スクロール
 * const { links, isLoading, fetchNextPage, hasNextPage } = useLinks();
 *
 * // フィルタリング（5件のみ取得）
 * const { links } = useLinks({ status: "read_soon", limit: 5 });
 * ```
 */
export function useLinks(options: UseLinksOptions = {}): UseLinksReturn {
  const {
    pageSize = DEFAULT_PAGE_SIZE,
    status,
    isRead,
    limit,
    orderBy,
  } = options;

  // orderByの正規化: nullをundefinedに変換してクエリキーを統一
  const normalizedOrderBy = orderBy === null ? undefined : orderBy;

  // フィルタパラメータ（クエリキー用）
  const filterParams: LinkFilterParams = {
    ...(status !== undefined && { status }),
    ...(isRead !== undefined && { isRead }),
    ...(limit !== undefined && { limit }),
    ...(normalizedOrderBy !== undefined && { orderBy: normalizedOrderBy }),
  };

  // 無限スクロール用のフィルタパラメータ（limitを除く）
  const infiniteFilterParams: Omit<LinkFilterParams, "limit"> = {
    ...(status !== undefined && { status }),
    ...(isRead !== undefined && { isRead }),
    ...(normalizedOrderBy !== undefined && { orderBy: normalizedOrderBy }),
  };
  const hasInfiniteFilters = Object.keys(infiniteFilterParams).length > 0;

  // limit指定時は単一ページ取得（useQuery）
  const singlePageQuery = useQuery({
    queryKey: linkQueryKeys.listLimited(filterParams),
    queryFn: () =>
      fetchUserLinks({
        pageSize,
        status,
        isRead,
        limit,
        orderBy: normalizedOrderBy,
      }),
    enabled: limit !== undefined,
  });

  // limit未指定時は無限スクロール（useInfiniteQuery）
  const infiniteQuery = useInfiniteQuery({
    queryKey: linkQueryKeys.list(
      hasInfiniteFilters ? infiniteFilterParams : undefined,
    ),
    queryFn: ({ pageParam = 0 }) =>
      fetchUserLinks({
        pageSize,
        page: pageParam,
        status,
        isRead,
        orderBy: normalizedOrderBy,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.hasMore) {
        return lastPageParam + 1;
      }
      return undefined;
    },
    enabled: limit === undefined,
  });

  // limit指定時は単一ページ取得の結果を使用
  if (limit !== undefined) {
    const rawLinks = singlePageQuery.data?.data ?? [];
    const links = dataHelpers.transformTimestamps<UserLink>(rawLinks, [
      "triaged_at",
      "read_at",
      "link_created_at",
    ]);

    return {
      links,
      isLoading: singlePageQuery.isLoading,
      isFetchingNextPage: false,
      isError: singlePageQuery.isError,
      error: singlePageQuery.error,
      hasNextPage: false, // limit指定時は常にfalse
      totalCount: singlePageQuery.data?.totalCount ?? 0,
      fetchNextPage: () => {}, // limit指定時は何もしない
      refetch: () => void singlePageQuery.refetch(),
      isRefreshing: singlePageQuery.isRefetching,
    };
  }

  // 全ページのデータをフラット化（無限スクロール時）
  const rawLinks = infiniteQuery.data?.pages.flatMap((page) => page.data) ?? [];

  // タイムスタンプフィールドを変換
  const links = dataHelpers.transformTimestamps<UserLink>(rawLinks, [
    "triaged_at",
    "read_at",
    "link_created_at",
  ]);

  // 最新ページのtotalCountを取得（なければ0）
  const totalCount =
    infiniteQuery.data?.pages[infiniteQuery.data.pages.length - 1]
      ?.totalCount ?? 0;

  return {
    links,
    isLoading: infiniteQuery.isLoading,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    isError: infiniteQuery.isError,
    error: infiniteQuery.error,
    hasNextPage: infiniteQuery.hasNextPage ?? false,
    totalCount,
    fetchNextPage: () => void infiniteQuery.fetchNextPage(),
    refetch: () => void infiniteQuery.refetch(),
    isRefreshing:
      infiniteQuery.isRefetching && !infiniteQuery.isFetchingNextPage,
  };
}
