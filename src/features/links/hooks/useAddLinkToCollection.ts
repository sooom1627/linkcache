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
 * 成功時に collectionQueryKeys.links と linkQueryKeys.detail を無効化する。
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
    onSuccess: (_, { collectionId, linkId }) => {
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.links(collectionId),
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
