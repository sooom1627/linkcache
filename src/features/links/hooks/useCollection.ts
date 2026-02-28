import { useQuery, useQueryClient } from "@tanstack/react-query";

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
 * 一覧画面からの遷移時は、キャッシュ済みの collections 一覧から該当アイテムを
 * placeholderData として即時表示し、バックグラウンドで単体取得を実行する。
 * 直接URL遷移時はキャッシュがなければローディング後に取得。
 *
 * @param id - コレクションID。空文字の場合はクエリを実行しない
 */
export function useCollection(id: string): UseCollectionReturn {
  const queryClient = useQueryClient();
  // 一覧は params 付きでキャッシュされるため、getQueriesData でプレフィックス一致して取得
  const queriesData = queryClient.getQueriesData<CollectionWithCount[]>({
    queryKey: collectionQueryKeys.lists(),
  });
  const cachedCollections = queriesData.find(
    (entry) => Array.isArray(entry[1]) && entry[1].length > 0,
  )?.[1] as CollectionWithCount[] | undefined;
  const placeholderData =
    id !== "" ? cachedCollections?.find((c) => c.id === id) : undefined;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: collectionQueryKeys.detail(id),
    queryFn: () => getCollection(id),
    enabled: id !== "",
    placeholderData,
  });

  return {
    collection: data ?? null,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}
