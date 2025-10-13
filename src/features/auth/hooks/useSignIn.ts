import type { AuthError } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";

import { signInWithPassword } from "../api";
import type { AuthResponse, SignInCredentials } from "../types/auth.types";

/**
 * サインイン用のカスタムフック
 *
 * @example
 * ```tsx
 * const { mutate: signIn, isPending, error } = useSignIn({
 *   onSuccess: (data) => {
 *     console.log('Signed in:', data.user);
 *   },
 *   onError: (error) => {
 *     Alert.alert('Error', error.message);
 *   }
 * });
 *
 * // 使用時
 * signIn({ email: 'user@example.com', password: 'password123' });
 * ```
 */
export function useSignIn(options?: {
  onSuccess?: (data: AuthResponse) => void;
  onError?: (error: AuthError) => void;
}) {
  return useMutation<AuthResponse, AuthError, SignInCredentials>({
    mutationFn: signInWithPassword,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
