import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutateFunction } from "@tanstack/react-query";

import { deleteCollection } from "../api/deleteCollection.api";
import { collectionQueryKeys } from "../constants/queryKeys";

export interface UseDeleteCollectionReturn {
  deleteCollection: UseMutateFunction<void, Error, string>;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
}

/**
 * コレクション削除フック
 *
 * 成功時に lists() のキャッシュを無効化します。
 * ON DELETE CASCADE により collection_links はDB側で自動削除されます。
 */
export function useDeleteCollection(): UseDeleteCollectionReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.lists(),
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
