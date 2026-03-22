import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  removeLinkFromCollection,
  type RemoveLinkFromCollectionParams,
} from "../api/removeLinkFromCollection.api";
import { collectionQueryKeys, linkQueryKeys } from "../constants/queryKeys";

/**
 * リンクをコレクションから削除するフック
 *
 * useMutation で removeLinkFromCollection API を呼び出し、
 * 楽観的更新（onMutate）とロールバック（onError）を実装。
 * onSettled 時に collectionQueryKeys.lists、collectionQueryKeys.links、collectionQueryKeys.forLink、linkQueryKeys.detail 等を無効化する。
 * ダッシュボード overview（linkQueryKeys.dashboardOverviewPrefix）は mutation 成功時（error === null）のみ無効化する。
 *
 * @returns removeLinkFromCollection（mutate）、removeLinkFromCollectionAsync（mutateAsync）、
 *   isPending、isError、isSuccess、error、reset
 *
 * @example
 * ```tsx
 * const { removeLinkFromCollection, removeLinkFromCollectionAsync } = useRemoveLinkFromCollection();
 * // コールバック形式
 * removeLinkFromCollection({ collectionId, linkId }, { onSuccess, onError });
 * // await が必要な場合
 * await removeLinkFromCollectionAsync({ collectionId, linkId });
 * ```
 */
export function useRemoveLinkFromCollection() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    void,
    Error,
    RemoveLinkFromCollectionParams,
    { previousIds: string[] | undefined }
  >({
    mutationFn: removeLinkFromCollection,
    onMutate: async ({ collectionId, linkId }) => {
      const queryKey = collectionQueryKeys.forLink(linkId);
      await queryClient.cancelQueries({ queryKey });
      const previousIds = queryClient.getQueryData<string[]>(queryKey);
      queryClient.setQueryData<string[]>(
        queryKey,
        (old) => old?.filter((id) => id !== collectionId) ?? [],
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
    onSettled: (_data, error, { collectionId, linkId }) => {
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.links(collectionId),
      });
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.forLink(linkId),
      });
      queryClient.invalidateQueries({
        queryKey: linkQueryKeys.detail(linkId),
      });
      queryClient.invalidateQueries({
        queryKey: linkQueryKeys.uncollectedList(),
      });
      queryClient.invalidateQueries({
        queryKey: linkQueryKeys.uncollectedCount(),
      });
      if (error === null) {
        queryClient.invalidateQueries({
          queryKey: linkQueryKeys.dashboardOverviewPrefix(),
        });
      }
    },
  });

  return {
    removeLinkFromCollection: mutation.mutate,
    removeLinkFromCollectionAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error as Error | null,
    reset: mutation.reset,
  };
}
