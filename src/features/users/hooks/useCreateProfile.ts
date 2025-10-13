import type { PostgrestError } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";

import { createProfile } from "../api";
import type { CreateProfileRequest, UserProfile } from "../types/users.types";

/**
 * プロフィール作成用のカスタムフック
 *
 * @example
 * ```tsx
 * const { mutate: createProfile, isPending } = useCreateProfile({
 *   onSuccess: (data) => {
 *     console.log('Profile created:', data);
 *     router.replace('/(tabs)');
 *   },
 *   onError: (error) => {
 *     Alert.alert('Error', error.message);
 *   }
 * });
 *
 * // 使用時
 * createProfile({ user_id: 'john_doe', username: 'John Doe' });
 * ```
 */
export function useCreateProfile(options?: {
  onSuccess?: (data: UserProfile) => void;
  onError?: (error: PostgrestError) => void;
}) {
  return useMutation<UserProfile, PostgrestError, CreateProfileRequest>({
    mutationFn: createProfile,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
