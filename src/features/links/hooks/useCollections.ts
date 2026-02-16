import { useQuery } from "@tanstack/react-query";

import { fetchCollections } from "../api/fetchCollections.api";
import { collectionQueryKeys } from "../constants/queryKeys";
import type {
  CollectionWithCount,
  FetchCollectionsParams,
} from "../types/collections.types";

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
 * @param params - オプション（limit, order）。未指定時は全件・updated_at 降順
 * @example
 * ```tsx
 * const { collections, isLoading } = useCollections();
 * const { collections } = useCollections({ limit: 5 });
 * ```
 */
export function useCollections(
  params?: FetchCollectionsParams,
): UseCollectionsReturn {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: collectionQueryKeys.lists(params),
    queryFn: () => fetchCollections(params),
  });

  return {
    collections: data ?? [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}
