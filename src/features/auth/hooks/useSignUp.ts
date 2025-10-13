import type { AuthError } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";

import { signUpWithPassword } from "../api";
import type { AuthResponse, SignUpCredentials } from "../types/auth.types";

/**
 * サインアップ用のカスタムフック
 *
 * @example
 * ```tsx
 * const { mutate: signUp, isPending, error } = useSignUp({
 *   onSuccess: (data) => {
 *     if (!data.session) {
 *       Alert.alert('Success', 'Please check your email for verification!');
 *     }
 *   },
 *   onError: (error) => {
 *     Alert.alert('Error', error.message);
 *   }
 * });
 *
 * // 使用時
 * signUp({ email: 'user@example.com', password: 'password123' });
 * ```
 */
export function useSignUp(options?: {
  onSuccess?: (data: AuthResponse) => void;
  onError?: (error: AuthError) => void;
}) {
  return useMutation<AuthResponse, AuthError, SignUpCredentials>({
    mutationFn: signUpWithPassword,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
