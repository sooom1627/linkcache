import { useQuery } from "@tanstack/react-query";

import { fetchCollectionIdsByLink } from "../api/fetchCollectionIdsByLink.api";
import { collectionQueryKeys } from "../constants/queryKeys";

/**
 * useCollectionsForLink の戻り値
 *
 * @property linkedCollectionIds - このリンクが属するコレクションIDの Set
 * @property isLoading - 初回読み込み中
 * @property isFetching - バックグラウンド再取得中
 * @property isError - エラー発生
 * @property error - エラーオブジェクト
 * @property refetch - 手動再取得関数
 */
export interface UseCollectionsForLinkReturn {
  linkedCollectionIds: Set<string>;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
}

/**
 * リンクに紐づくコレクションID一覧を取得するフック
 *
 * useQuery で fetchCollectionIdsByLink を呼び出し、結果を Set で返す。
 * LinkDetailScreen でこのリンクが属するコレクションの表示・トグルに使用する。
 *
 * @param linkId - リンクID。空文字の場合は取得しない
 * @example
 * ```tsx
 * const { linkedCollectionIds, isLoading, isFetching } = useCollectionsForLink(linkId);
 * const isUpdating = isLoading || isFetching || isPending;
 * ```
 */
export function useCollectionsForLink(
  linkId: string,
): UseCollectionsForLinkReturn {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: collectionQueryKeys.forLink(linkId),
    queryFn: () => fetchCollectionIdsByLink(linkId),
    enabled: linkId !== "",
  });

  const ids = data ?? [];
  const linkedCollectionIds = new Set(ids);

  return {
    linkedCollectionIds,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
}
