import { useInfiniteQuery } from "@tanstack/react-query";

import { dataHelpers } from "@/src/shared/utils/timezone";

import { fetchUserLinks } from "../api/fetchLinks.api";
import { collectionQueryKeys } from "../constants/queryKeys";
import type { LinkFilterParams, UserLink } from "../types/linkList.types";

/** コレクション内リンクの1ページあたりの件数 */
const COLLECTION_PAGE_SIZE = 20;

export interface UseCollectionLinksReturn {
  links: UserLink[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  isError: boolean;
  error: Error | null;
  hasNextPage: boolean;
  totalCount: number;
  fetchNextPage: () => void;
  refetch: () => Promise<unknown>;
}

/**
 * コレクション内リンク一覧を取得するフック
 *
 * useInfiniteQuery でページング対応。fetchUserLinks({ collectionId, pageSize, page })
 * を呼び出し、hasMore に応じて次のページを取得する。
 * status, isRead でステータス・既読状態の絞り込みが可能。
 *
 * @param collectionId - コレクションID。空文字の場合はクエリを実行しない
 * @param filterParams - フィルタパラメータ（status, isRead）
 */
export function useCollectionLinks(
  collectionId: string,
  filterParams?: Pick<LinkFilterParams, "status" | "isRead">,
): UseCollectionLinksReturn {
  const infiniteQuery = useInfiniteQuery({
    queryKey: collectionQueryKeys.links(collectionId, filterParams),
    queryFn: ({ pageParam = 0 }) =>
      fetchUserLinks({
        collectionId,
        pageSize: COLLECTION_PAGE_SIZE,
        page: pageParam,
        status: filterParams?.status,
        isRead: filterParams?.isRead,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.hasMore) {
        return lastPageParam + 1;
      }
      return undefined;
    },
    enabled: collectionId !== "",
  });

  const rawLinks = infiniteQuery.data?.pages.flatMap((page) => page.data) ?? [];

  const links = dataHelpers.transformTimestamps<UserLink>(rawLinks, [
    "triaged_at",
    "read_at",
    "link_created_at",
  ]);

  const totalCount =
    infiniteQuery.data?.pages[infiniteQuery.data.pages.length - 1]
      ?.totalCount ?? 0;

  return {
    links,
    isLoading: infiniteQuery.isLoading,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    isError: infiniteQuery.isError,
    error:
      infiniteQuery.error instanceof Error
        ? infiniteQuery.error
        : infiniteQuery.error
          ? new Error(String(infiniteQuery.error))
          : null,
    hasNextPage: infiniteQuery.hasNextPage ?? false,
    totalCount,
    fetchNextPage: () => void infiniteQuery.fetchNextPage(),
    refetch: () => infiniteQuery.refetch(),
  };
}
