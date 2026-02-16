import { useQuery } from "@tanstack/react-query";

import { fetchCollections } from "../api/fetchCollections.api";
import { collectionQueryKeys } from "../constants/queryKeys";
import type { CollectionWithCount } from "../types/collections.types";

/**
 * コレクション一覧取得フックの戻り値
 */
export interface UseCollectionsReturn {
  collections: CollectionWithCount[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
}

/**
 * コレクション一覧取得フック
 *
 * useQuery で fetchCollections を呼び出し、キャッシュします。
 * create/update/delete 成功時に useCreateCollection 等が lists() を無効化するため、
 * 一覧は自動的に再取得されます。
 *
 * @example
 * ```tsx
 * const { collections, isLoading } = useCollections();
 * ```
 */
export function useCollections(): UseCollectionsReturn {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: collectionQueryKeys.lists(),
    queryFn: fetchCollections,
  });

  return {
    collections: data ?? [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}
