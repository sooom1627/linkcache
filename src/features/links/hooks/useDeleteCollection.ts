import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutateFunction } from "@tanstack/react-query";

import { deleteCollection } from "../api/deleteCollection.api";
import { collectionQueryKeys, linkQueryKeys } from "../constants/queryKeys";

/** useDeleteCollection フックの戻り値 */
export interface UseDeleteCollectionReturn {
  /** コレクションを削除する mutate 関数。第2引数で onSuccess/onError コールバックを渡せる */
  deleteCollection: UseMutateFunction<void, Error, string>;
  /** ミューテーション実行中フラグ。UI でボタン無効化に使用 */
  isPending: boolean;
  /** エラー状態フラグ */
  isError: boolean;
  /** 成功状態フラグ */
  isSuccess: boolean;
  /** エラーオブジェクト */
  error: Error | null;
}

/**
 * コレクション削除フック
 *
 * useMutation で deleteCollection API を呼び出し、
 * 成功時に collectionQueryKeys.all（["collections"]）を invalidate します。
 * これにより lists / detail / links / forLink すべての関連キャッシュが
 * 一括でクリアされます。
 * ON DELETE CASCADE により collection_links はDB側で自動削除されます。
 *
 * @example
 * ```tsx
 * const { deleteCollection, isPending } = useDeleteCollection();
 * deleteCollection(collectionId, { onSuccess: () => router.back() });
 * ```
 */
export function useDeleteCollection(): UseDeleteCollectionReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: linkQueryKeys.dashboardOverviewPrefix(),
      });
    },
  });

  return {
    deleteCollection: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error as Error | null,
  };
}
