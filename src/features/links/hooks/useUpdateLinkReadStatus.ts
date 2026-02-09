import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateLinkReadStatus } from "../api/updateLinkReadStatus.api";
import { linkQueryKeys } from "../constants/queryKeys";
import type { TriageStatus } from "../types";

/**
 * リンク既読状態更新フックの戻り値
 */
export interface UseUpdateLinkReadStatusReturn {
  /**
   * リンクの既読状態を更新する関数
   * @param linkId - 更新するリンクのID（UUID形式）
   * @param isRead - 既読にする場合はtrue、未読にする場合はfalse
   * @param status - ステータスを更新する場合の新しいステータス値（オプション）
   */
  updateReadStatus: (
    linkId: string,
    isRead: boolean,
    status?: TriageStatus,
  ) => void;
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
 *   // 既読時にステータスをdoneに更新
 *   updateReadStatus("123e4567-e89b-12d3-a456-426614174000", true, "done");
 * };
 *
 * const handleMarkAsUnread = () => {
 *   // 未読時にステータスをread_soonに更新
 *   updateReadStatus("123e4567-e89b-12d3-a456-426614174000", false, "read_soon");
 * };
 * ```
 */
export function useUpdateLinkReadStatus(): UseUpdateLinkReadStatusReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, [string, boolean, TriageStatus?]>({
    mutationFn: ([linkId, isRead, status]) =>
      updateLinkReadStatus(linkId, isRead, status),
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
      // リンク件数のキャッシュも無効化
      queryClient.invalidateQueries({
        queryKey: linkQueryKeys.count(),
      });
    },
  });

  return {
    updateReadStatus: (
      linkId: string,
      isRead: boolean,
      status?: TriageStatus,
    ) => {
      mutation.mutate([linkId, isRead, status]);
    },
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}
