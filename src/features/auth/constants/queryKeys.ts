/**
 * 認証関連のReact Queryキャッシュキー
 *
 * 認証機能に関連するクエリキーを管理します。
 * - セッション情報
 * - 認証ユーザー情報
 *
 * @example
 * ```ts
 * // セッション取得
 * useQuery({ queryKey: authQueryKeys.session(), ... });
 *
 * // 認証キャッシュのクリア
 * queryClient.removeQueries({ queryKey: authQueryKeys.all });
 * ```
 */
export const authQueryKeys = {
  /**
   * 認証関連のすべてのクエリキー
   * ログアウト時などに一括削除する際に使用
   */
  all: ["auth"] as const,

  /**
   * セッション情報のクエリキー
   */
  session: () => [...authQueryKeys.all, "session"] as const,

  /**
   * 認証ユーザー情報のクエリキー
   */
  user: () => [...authQueryKeys.all, "user"] as const,
} as const;
