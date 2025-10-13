/**
 * ユーザー関連のReact Queryキャッシュキー
 *
 * ユーザー機能に関連するクエリキーを管理します。
 * - ユーザー一覧
 * - ユーザー詳細
 * - プロフィール情報
 *
 * @example
 * ```ts
 * // 自分のプロフィール取得
 * useQuery({ queryKey: userQueryKeys.profile(), ... });
 *
 * // 特定ユーザー詳細取得
 * useQuery({ queryKey: userQueryKeys.detail('user-id'), ... });
 *
 * // ユーザーキャッシュのクリア
 * queryClient.removeQueries({ queryKey: userQueryKeys.all });
 * ```
 */
export const userQueryKeys = {
  /**
   * ユーザー関連のすべてのクエリキー
   * ログアウト時などに一括削除する際に使用
   */
  all: ["users"] as const,

  /**
   * ユーザー一覧の基底キー
   */
  lists: () => [...userQueryKeys.all, "list"] as const,

  /**
   * フィルター付きユーザー一覧のクエリキー
   * @param filters - フィルター条件（role, status など）
   */
  list: (filters?: Record<string, unknown>) =>
    [...userQueryKeys.lists(), filters] as const,

  /**
   * ユーザー詳細の基底キー
   */
  details: () => [...userQueryKeys.all, "detail"] as const,

  /**
   * 特定ユーザー詳細のクエリキー
   * @param id - ユーザーID
   */
  detail: (id: string) => [...userQueryKeys.details(), id] as const,

  /**
   * 現在のユーザープロフィールのクエリキー
   */
  profile: () => [...userQueryKeys.all, "profile"] as const,
} as const;
