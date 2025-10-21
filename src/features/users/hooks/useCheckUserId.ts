import type { PostgrestError } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

import { useDebounce } from "@/src/shared/hooks/useDebounce";

import { checkUserIdAvailability } from "../api";

/**
 * user_id重複チェック用のカスタムフック
 *
 * 入力値を500msデバウンスしてからAPI呼び出しを行います。
 * タイピング中の連続したAPI呼び出しを防ぎ、パフォーマンスを向上させます。
 *
 * @param userId - チェックするuser_id
 * @param enabled - クエリを有効にするかどうか（デフォルト: true）
 * @param excludeUserId - 除外するuser_id（更新時に現在のuser_idを除外する場合に使用）
 * @returns user_idが利用可能かどうかの情報
 *
 * @example
 * ```tsx
 * // 新規作成時
 * const { data: isAvailable, isLoading } = useCheckUserId(userId, userId.length >= 4);
 *
 * // 更新時（現在のuser_idを除外）
 * const { data: isAvailable, isLoading } = useCheckUserId(
 *   userId,
 *   userId.length >= 4,
 *   currentUserId
 * );
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
export function useCheckUserId(
  userId: string,
  enabled: boolean = true,
  excludeUserId?: string,
) {
  // user_idを500msデバウンス（タイピング中のAPI呼び出しを防ぐ）
  const debouncedUserId: string = useDebounce<string>(userId, 500);

  return useQuery<boolean, PostgrestError>({
    queryKey: ["check-user-id", debouncedUserId, excludeUserId],
    queryFn: () => checkUserIdAvailability(debouncedUserId, excludeUserId),
    enabled: enabled && debouncedUserId.length >= 4,
    staleTime: 5000, // 5秒間キャッシュして不要な再取得を防ぐ
    retry: 1, // エラー時のリトライ回数を1回に制限
  });
}
