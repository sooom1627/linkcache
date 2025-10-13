import type { AuthError } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";

import { signOut } from "../api";

/**
 * サインアウト用のカスタムフック
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
  return useMutation<void, AuthError, void>({
    mutationFn: signOut,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
