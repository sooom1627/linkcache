import type { PostgrestError } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

import { checkUserIdAvailability } from "../api";

/**
 * user_id重複チェック用のカスタムフック
 *
 * @param userId - チェックするuser_id
 * @param enabled - クエリを有効にするかどうか（デフォルト: true）
 * @returns user_idが利用可能かどうかの情報
 *
 * @example
 * ```tsx
 * const { data: isAvailable, isLoading } = useCheckUserId(userId, userId.length >= 4);
 *
 * if (isLoading) {
 *   return <Text>Checking...</Text>;
 * }
 *
 * if (isAvailable) {
 *   return <Text>✓ Available</Text>;
 * } else {
 *   return <Text>✗ Already taken</Text>;
 * }
 * ```
 */
export function useCheckUserId(userId: string, enabled: boolean = true) {
  return useQuery<boolean, PostgrestError>({
    queryKey: ["check-user-id", userId],
    queryFn: () => checkUserIdAvailability(userId),
    enabled: enabled && userId.length >= 4,
    staleTime: 5000, // 5秒間キャッシュして不要な再取得を防ぐ
    retry: 1, // エラー時のリトライ回数を1回に制限
  });
}
