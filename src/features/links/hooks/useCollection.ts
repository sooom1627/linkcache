import { useQuery } from "@tanstack/react-query";

import { getCollection } from "../api/getCollection.api";
import { collectionQueryKeys } from "../constants/queryKeys";
import type { CollectionWithCount } from "../types/collections.types";

/**
 * コレクション詳細取得フックの戻り値
 */
export interface UseCollectionReturn {
  collection: CollectionWithCount | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
}

/**
 * 指定IDのコレクション詳細を取得するフック
 *
 * 直接URL遷移時や一覧未ロード時のフォールバック用。
 * useCollections で一覧から見つからない場合に使用する。
 *
 * @param id - コレクションID。空文字の場合はクエリを実行しない
 * @example
 * ```tsx
 * const { collection, isLoading } = useCollection(collectionId ?? "");
 * const resolved = collections.find(c => c.id === id) ?? collection;
 * ```
 */
export function useCollection(id: string): UseCollectionReturn {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: collectionQueryKeys.detail(id),
    queryFn: () => getCollection(id),
    enabled: id != null && id !== "",
  });

  return {
    collection: data ?? null,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}
