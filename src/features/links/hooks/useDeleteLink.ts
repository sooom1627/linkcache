import type { MutateOptions } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteLinkById } from "../api/deleteLink.api";
import { collectionQueryKeys, linkQueryKeys } from "../constants/queryKeys";

/**
 * リンク削除フックの戻り値
 */
export interface UseDeleteLinkReturn {
  deleteLink: (linkId: string) => void;
  /**
   * リンク削除を非同期で実行する関数
   * React QueryのmutateAsyncと同じシグネチャ
   * @param linkId - 削除するリンクのID
   * @param options - React Queryのmutationオプション（オプショナル）
   */
  deleteLinkAsync: (
    linkId: string,
    options?: MutateOptions<void, Error, string, unknown>,
  ) => Promise<void>;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * リンク削除フック
 *
 * 指定されたlink_idのリンクを削除します。
 * 削除成功後、リンク一覧と詳細のキャッシュを無効化します。
 *
 * @returns リンク削除mutation関数と状態
 *
 * @example
 * ```tsx
 * const { deleteLink, isPending, isError, isSuccess } = useDeleteLink();
 *
 * const handleDelete = () => {
 *   deleteLink("123e4567-e89b-12d3-a456-426614174000");
 * };
 * ```
 */
export function useDeleteLink(): UseDeleteLinkReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, string>({
    mutationFn: deleteLinkById,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: linkQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: linkQueryKeys.details(),
      });
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: linkQueryKeys.dashboardOverviewPrefix(),
      });
    },
  });

  return {
    deleteLink: mutation.mutate,
    deleteLinkAsync:
      mutation.mutateAsync as UseDeleteLinkReturn["deleteLinkAsync"],
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}
