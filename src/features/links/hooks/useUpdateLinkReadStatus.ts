import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateLinkReadStatus } from "../api/updateLinkReadStatus.api";
import { linkQueryKeys } from "../constants/queryKeys";

/**
 * リンク既読状態更新フックの戻り値
 */
export interface UseUpdateLinkReadStatusReturn {
  /**
   * リンクの既読状態を更新する関数
   * @param linkId - 更新するリンクのID（UUID形式）
   * @param isRead - 既読にする場合はtrue、未読にする場合はfalse
   */
  updateReadStatus: (linkId: string, isRead: boolean) => void;
  /** mutationが実行中かどうか */
  isPending: boolean;
  /** mutationがエラー状態かどうか */
  isError: boolean;
  /** mutationが成功したかどうか */
  isSuccess: boolean;
  /** mutationのエラーオブジェクト（エラー時のみ） */
  error: Error | null;
  /** mutation状態をリセットする関数 */
  reset: () => void;
}

/**
 * リンク既読状態更新フック
 *
 * 指定されたlink_idのリンクの既読状態を更新します。
 * 更新成功後、リンク一覧と詳細のキャッシュを無効化します。
 *
 * @returns リンク既読状態更新mutation関数と状態
 *
 * @example
 * ```tsx
 * const { updateReadStatus, isPending, isError, isSuccess } = useUpdateLinkReadStatus();
 *
 * const handleMarkAsRead = () => {
 *   updateReadStatus("123e4567-e89b-12d3-a456-426614174000", true);
 * };
 *
 * const handleMarkAsUnread = () => {
 *   updateReadStatus("123e4567-e89b-12d3-a456-426614174000", false);
 * };
 * ```
 */
export function useUpdateLinkReadStatus(): UseUpdateLinkReadStatusReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, [string, boolean]>({
    mutationFn: ([linkId, isRead]) => updateLinkReadStatus(linkId, isRead),
    onSuccess: (_, [linkId]) => {
      // リンク既読状態更新成功時にリンク一覧と詳細のキャッシュを無効化
      // これにより、次回の取得時に最新データが取得される
      queryClient.invalidateQueries({
        queryKey: linkQueryKeys.lists(),
      });
      // 全てのリンク詳細のキャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: linkQueryKeys.details(),
      });
      // 特定のリンクIDのキャッシュも明示的に無効化（即座に更新されるように）
      queryClient.invalidateQueries({
        queryKey: linkQueryKeys.detail(linkId),
      });
    },
  });

  return {
    updateReadStatus: (linkId: string, isRead: boolean) => {
      mutation.mutate([linkId, isRead]);
    },
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}
