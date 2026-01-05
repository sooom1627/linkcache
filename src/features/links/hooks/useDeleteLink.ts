import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteLinkById } from "../api/deleteLink.api";
import { linkQueryKeys } from "../constants/queryKeys";

/**
 * リンク削除フックの戻り値
 */
export interface UseDeleteLinkReturn {
  deleteLink: (linkId: string) => void;
  deleteLinkAsync: (linkId: string) => Promise<void>;
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

  const mutation = useMutation({
    mutationFn: deleteLinkById,
    onSuccess: () => {
      // リンク削除成功時にリンク一覧と詳細のキャッシュを無効化
      // これにより、次回の取得時に最新データが取得される
      queryClient.invalidateQueries({
        queryKey: linkQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: linkQueryKeys.details(),
      });
    },
  });

  return {
    deleteLink: mutation.mutate,
    deleteLinkAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}
