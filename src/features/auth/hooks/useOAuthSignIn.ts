import type { AuthError } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";

import { signInWithOAuth } from "../api";
import type { OAuthProvider } from "../types/auth.types";

/**
 * OAuth サインイン用のカスタムフック
 *
 * Google、GitHub、Appleなどのソーシャルログインに使用します。
 *
 * @example
 * ```tsx
 * const { mutate: signInWithGoogle, isPending } = useOAuthSignIn({
 *   onError: (error) => {
 *     Alert.alert('Error', error.message);
 *   }
 * });
 *
 * // 使用時
 * signInWithGoogle('google');
 * ```
 */
export function useOAuthSignIn(options?: {
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
}) {
  return useMutation<void, AuthError, OAuthProvider>({
    mutationFn: signInWithOAuth,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
