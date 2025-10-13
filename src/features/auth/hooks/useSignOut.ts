import type { AuthError } from "@supabase/supabase-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userQueryKeys } from "@/src/features/users/constants/queryKeys";

import { signOut } from "../api";
import { authQueryKeys } from "../constants/queryKeys";

/**
 * サインアウト用のカスタムフック
 *
 * ログアウト時に以下の処理を実行：
 * 1. Supabaseセッションのクリア
 * 2. React Queryキャッシュの選択的クリア（セキュリティとプライバシー保護）
 *    - 認証関連キャッシュ（authQueryKeys.all）
 *    - ユーザー関連キャッシュ（userQueryKeys.all）
 *
 * @example
 * ```tsx
 * const { mutate: handleSignOut, isPending } = useSignOut({
 *   onSuccess: () => {
 *     console.log('Signed out successfully');
 *   },
 *   onError: (error) => {
 *     Alert.alert('Error', error.message);
 *   }
 * });
 *
 * // 使用時
 * handleSignOut();
 * ```
 */
export function useSignOut(options?: {
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<void, AuthError, void>({
    mutationFn: signOut,
    onSuccess: () => {
      // ユーザー固有のキャッシュを選択的にクリア
      // セキュリティ: 前のユーザーのデータが次のユーザーに見えないようにする
      queryClient.removeQueries({ queryKey: authQueryKeys.all });
      queryClient.removeQueries({ queryKey: userQueryKeys.all });

      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
}
