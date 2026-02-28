import type { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import i18n from "@/src/shared/utils/i18n";
import { showToastError, showToastSuccess } from "@/src/shared/utils/toast";

import { useAuth } from "../../auth";
import { deleteAvatar } from "../api";
import { userQueryKeys } from "../constants/queryKeys";

/**
 * アバター画像削除用のカスタムフック
 *
 * Supabase Storageからのアバター画像削除と
 * プロフィールのavatar_urlをnullに更新します。
 *
 * @param options - コールバックオプション
 * @returns mutate関数と処理状態
 *
 * @example
 * ```tsx
 * const { mutate: deleteAvatar, isPending } = useDeleteAvatar({
 *   onSuccess: () => {
 *     console.log('Avatar deleted');
 *   },
 *   onError: (error) => {
 *     Alert.alert('Error', error.message);
 *   }
 * });
 *
 * // 使用時
 * deleteAvatar();
 * ```
 */
export function useDeleteAvatar(options?: {
  onSuccess?: () => void;
  onError?: (error: PostgrestError) => void;
}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const handleDeleteAvatar = useMutation<void, PostgrestError, void>({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // APIを呼び出し
      return deleteAvatar(user.id);
    },
    onSuccess: () => {
      // プロフィールクエリを無効化して再取得
      queryClient.invalidateQueries({ queryKey: userQueryKeys.profile() });
      showToastSuccess(i18n.t("users.user_card.avatar_delete_success"));
      options?.onSuccess?.();
    },
    onError: (error) => {
      showToastError(
        i18n.t("common.error_title", { defaultValue: "Error" }),
        i18n.t("users.user_card.avatar_delete_failed"),
      );
      console.error("Error deleting avatar:", error);
      options?.onError?.(error);
    },
  });

  return handleDeleteAvatar;
}
