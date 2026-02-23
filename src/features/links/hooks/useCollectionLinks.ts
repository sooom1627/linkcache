import { useQuery } from "@tanstack/react-query";

import { dataHelpers } from "@/src/shared/utils/timezone";

import { fetchUserLinks } from "../api/fetchLinks.api";
import { collectionQueryKeys } from "../constants/queryKeys";
import type { UserLink } from "../types/linkList.types";

export interface UseCollectionLinksReturn {
  links: UserLink[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
}

/**
 * コレクション内リンク一覧を取得するフック
 *
 * 既存の fetchUserLinks({ collectionId }) を呼び出し、
 * collectionQueryKeys.links(collectionId) でキャッシュする。
 *
 * @param collectionId - コレクションID。空文字の場合はクエリを実行しない
 */
export function useCollectionLinks(
  collectionId: string,
): UseCollectionLinksReturn {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: collectionQueryKeys.links(collectionId),
    queryFn: () => fetchUserLinks({ collectionId }),
    enabled: collectionId !== "",
    select: (response) =>
      dataHelpers.transformTimestamps<UserLink>(response.data, [
        "triaged_at",
        "read_at",
        "link_created_at",
      ]),
  });

  return {
    links: data ?? [],
    isLoading,
    isError,
    error:
      error instanceof Error ? error : error ? new Error(String(error)) : null,
    refetch,
  };
}
