import type { PostgrestError } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

import { getMyProfile } from "../api";
import type { UserProfile } from "../types/users.types";

/**
 * 現在のユーザーのプロフィールを取得するフック
 *
 * @example
 * ```tsx
 * const { data: profile, isLoading } = useProfile();
 *
 * if (isLoading) {
 *   return <Text>Loading...</Text>;
 * }
 *
 * if (!profile) {
 *   // プロフィール未設定
 *   router.replace('/setup-profile');
 * }
 * ```
 */
export function useProfile() {
  return useQuery<UserProfile | null, PostgrestError>({
    queryKey: ["profile"],
    queryFn: getMyProfile,
    retry: 1,
  });
}
