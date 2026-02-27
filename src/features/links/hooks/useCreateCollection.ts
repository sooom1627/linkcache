import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createCollection } from "../api/createCollection.api";
import { collectionQueryKeys } from "../constants/queryKeys";
import type { Collection } from "../types/links.types";

/**
 * コレクション作成フックの戻り値
 */
export interface UseCreateCollectionReturn {
  createCollection: (params: { name: string; emoji?: string | null }) => void;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
  data: Collection | undefined;
  reset: () => void;
}

/**
 * コレクション作成フック
 *
 * useMutation で createCollection API を呼び出し、
 * 成功時にコレクション一覧のキャッシュを無効化します。
 *
 * @example
 * ```tsx
 * const { createCollection, isPending } = useCreateCollection();
 * createCollection({ name: "My Collection", emoji: "📚" }, {
 *   onSuccess: () => modal.close(),
 * });
 * ```
 */
export function useCreateCollection(): UseCreateCollectionReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.lists(),
      });
    },
  });

  return {
    createCollection: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error as Error | null,
    data: mutation.data,
    reset: mutation.reset,
  };
}
