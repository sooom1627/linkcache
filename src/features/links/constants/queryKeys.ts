/**
 * リンク関連のReact Queryキャッシュキー
 *
 * リンク機能に関連するクエリキーを管理します。
 *
 * @example
 * ```ts
 * // リンク一覧取得
 * useInfiniteQuery({ queryKey: linkQueryKeys.list(), ... });
 *
 * // リンクキャッシュのクリア
 * queryClient.invalidateQueries({ queryKey: linkQueryKeys.all });
 * ```
 */
export const linkQueryKeys = {
  /**
   * リンク関連のすべてのクエリキー
   * ログアウト時などに一括削除する際に使用
   */
  all: ["links"] as const,

  /**
   * リンク一覧の基底キー
   */
  lists: () => [...linkQueryKeys.all, "list"] as const,

  /**
   * リンク一覧のクエリキー（ページングはReact Queryが管理）
   */
  list: () => [...linkQueryKeys.lists()] as const,

  /**
   * リンク詳細の基底キー
   */
  details: () => [...linkQueryKeys.all, "detail"] as const,

  /**
   * 特定リンク詳細のクエリキー
   * @param id - リンクID
   */
  detail: (id: string) => [...linkQueryKeys.details(), id] as const,
} as const;

