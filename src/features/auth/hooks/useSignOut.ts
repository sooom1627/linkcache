import type { AuthError } from "@supabase/supabase-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { signOut } from "../api";

/**
 * サインアウト用のカスタムフック
 *
 * ログアウト時に以下の処理を実行：
 * 1. Supabaseセッションのクリア
 * 2. React Queryキャッシュの完全クリア（セキュリティとプライバシー保護）
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
      // React Queryの全キャッシュをクリア
      // セキュリティ: 前のユーザーのデータが次のユーザーに見えないようにする
      queryClient.clear();

      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
}
