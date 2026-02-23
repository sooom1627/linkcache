import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutateFunction } from "@tanstack/react-query";

import { updateCollection } from "../api/updateCollection.api";
import { collectionQueryKeys } from "../constants/queryKeys";
import type { UpdateCollectionParams } from "../types/collections.types";
import type { Collection } from "../types/links.types";

export interface UseUpdateCollectionReturn {
  updateCollection: UseMutateFunction<
    Collection,
    Error,
    { id: string; params: UpdateCollectionParams }
  >;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
  data: Collection | undefined;
}

/**
 * コレクション更新フック
 *
 * 成功時に lists() と detail(id) のキャッシュを無効化します。
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
