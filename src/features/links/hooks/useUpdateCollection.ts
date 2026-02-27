import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutateFunction } from "@tanstack/react-query";

import { updateCollection } from "../api/updateCollection.api";
import { collectionQueryKeys } from "../constants/queryKeys";
import type { UpdateCollectionParams } from "../types/collections.types";
import type { Collection } from "../types/links.types";

/** useUpdateCollection フックの戻り値 */
export interface UseUpdateCollectionReturn {
  /** コレクションを更新する mutate 関数。第2引数で onSuccess/onError コールバックを渡せる */
  updateCollection: UseMutateFunction<
    Collection,
    Error,
    { id: string; params: UpdateCollectionParams }
  >;
  /** ミューテーション実行中フラグ */
  isPending: boolean;
  /** エラー状態フラグ */
  isError: boolean;
  /** 成功状態フラグ */
  isSuccess: boolean;
  /** エラーオブジェクト */
  error: Error | null;
  /** 更新後のコレクション */
  data: Collection | undefined;
}

/**
 * コレクション更新フック
 *
 * useMutation で updateCollection API を呼び出し、
 * 成功時に lists() と detail(id) のキャッシュを無効化します。
 *
 * @example
 * ```tsx
 * const { updateCollection, isPending } = useUpdateCollection();
 * updateCollection(
 *   { id: collectionId, params: { name: "New Name", emoji: "🎯" } },
 *   { onSuccess: () => modal.close() },
 * );
 * ```
 */
export function useUpdateCollection(): UseUpdateCollectionReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateCollection,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.detail(data.id),
      });
    },
  });

  return {
    updateCollection: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error as Error | null,
    data: mutation.data,
  };
}
