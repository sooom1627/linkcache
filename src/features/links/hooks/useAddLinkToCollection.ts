import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addLinkToCollection } from "../api/addLinkToCollection.api";
import { collectionQueryKeys, linkQueryKeys } from "../constants/queryKeys";
import type { CollectionLink } from "../types/links.types";

export interface AddLinkToCollectionArgs {
  collectionId: string;
  linkId: string;
}

/**
 * リンクをコレクションに追加するフック
 *
 * useMutation で addLinkToCollection API を呼び出し、
 * 楽観的更新（onMutate）とロールバック（onError）を実装。
 * 成功時に collectionQueryKeys.links、collectionQueryKeys.forLink、linkQueryKeys.detail を無効化する。
 *
 * @example
 * ```tsx
 * const { addLinkToCollection, addLinkToCollectionAsync } = useAddLinkToCollection();
 * addLinkToCollection({ collectionId, linkId }, { onSuccess, onError });
 * // または await が必要な場合
 * await addLinkToCollectionAsync({ collectionId, linkId });
 * ```
 */
export function useAddLinkToCollection() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addLinkToCollection,
    onMutate: async ({ collectionId, linkId }) => {
      const queryKey = collectionQueryKeys.forLink(linkId);
      await queryClient.cancelQueries({ queryKey });
      const previousIds = queryClient.getQueryData<string[]>(queryKey);
      queryClient.setQueryData<string[]>(queryKey, (old) =>
        old?.includes(collectionId) ? old : [...(old ?? []), collectionId],
      );
      return { previousIds };
    },
    onError: (_, { linkId }, context) => {
      if (context?.previousIds != null) {
        queryClient.setQueryData(
          collectionQueryKeys.forLink(linkId),
          context.previousIds,
        );
      }
    },
    onSettled: (_data, _error, { collectionId, linkId }) => {
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.links(collectionId),
      });
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.forLink(linkId),
      });
      queryClient.invalidateQueries({
        queryKey: linkQueryKeys.detail(linkId),
      });
    },
  });

  return {
    addLinkToCollection: mutation.mutate,
    addLinkToCollectionAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error as Error | null,
    data: mutation.data as CollectionLink | undefined,
    reset: mutation.reset,
  };
}
