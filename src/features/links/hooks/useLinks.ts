import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchUserLinks } from "../api/fetchLinks.api";
import { linkQueryKeys } from "../constants/queryKeys";
import type { UserLink } from "../types/linkList.types";

/** デフォルトのページサイズ */
const DEFAULT_PAGE_SIZE = 20;

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
 *
 * @param pageSize - 1ページあたりの件数 (デフォルト: 20)
 * @returns リンク一覧とページング関連の状態・関数
 *
 * @example
 * ```tsx
 * const { links, isLoading, fetchNextPage, hasNextPage } = useLinks();
 *
 * // FlashListのonEndReachedで次ページ取得
 * <FlashList
 *   data={links}
 *   onEndReached={() => hasNextPage && fetchNextPage()}
 * />
 * ```
 */
export function useLinks(pageSize: number = DEFAULT_PAGE_SIZE): UseLinksReturn {
  const query = useInfiniteQuery({
    queryKey: linkQueryKeys.list(),
    queryFn: ({ pageParam = 0 }) =>
      fetchUserLinks({ pageSize, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      // hasMoreがtrueなら次のページ番号を返す
      if (lastPage.hasMore) {
        return lastPageParam + 1;
      }
      return undefined;
    },
  });

  // 全ページのデータをフラット化
  const links = query.data?.pages.flatMap((page) => page.data) ?? [];

  // 最新ページのtotalCountを取得（なければ0）
  const totalCount =
    query.data?.pages[query.data.pages.length - 1]?.totalCount ?? 0;

  return {
    links,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    isError: query.isError,
    error: query.error,
    hasNextPage: query.hasNextPage ?? false,
    totalCount,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
    isRefreshing: query.isRefetching && !query.isFetchingNextPage,
  };
}

