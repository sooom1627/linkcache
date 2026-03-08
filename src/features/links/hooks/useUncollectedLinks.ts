import { useInfiniteQuery } from "@tanstack/react-query";

import { dataHelpers } from "@/src/shared/utils/timezone";

import { fetchUserLinks } from "../api/fetchLinks.api";
import { linkQueryKeys } from "../constants/queryKeys";
import type { LinkFilterParams, UserLink } from "../types/linkList.types";

import type { UseCollectionLinksReturn } from "./useCollectionLinks";

const UNCOLLECTED_PAGE_SIZE = 20;

/**
 * コレクション未所属リンク一覧を取得するフック
 *
 * useInfiniteQuery でページング対応。status, isRead による絞り込みをサポートする。
 */
export function useUncollectedLinks(
  filterParams?: Pick<LinkFilterParams, "status" | "isRead">,
): UseCollectionLinksReturn {
  const infiniteQuery = useInfiniteQuery({
    queryKey: linkQueryKeys.uncollectedList(filterParams),
    queryFn: ({ pageParam = 0 }) =>
      fetchUserLinks({
        uncollectedOnly: true,
        pageSize: UNCOLLECTED_PAGE_SIZE,
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
