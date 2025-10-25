import type { PostgrestError } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

import { getMyProfile } from "../api";
import { userQueryKeys } from "../constants/queryKeys";
import type { UserProfile } from "../types/users.types";

/**
 * 現在のユーザーのプロフィールを取得するフック
 *
 * キャッシュ戦略:
 * - staleTime: Infinity（永続キャッシュ）
 * - プロフィールは明示的な更新時のみinvalidateされる
 * - 不要な再フェッチを完全に防ぎ、パフォーマンスとバッテリーを最適化
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
    queryKey: userQueryKeys.profile(),
    queryFn: getMyProfile,
    staleTime: Infinity, // 永続キャッシュ：明示的なinvalidate時のみ更新
    retry: 1,
  });
}
