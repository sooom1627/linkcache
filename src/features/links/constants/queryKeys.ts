import type { LinkFilterParams } from "../types/linkList.types";

/**
 * リンク関連のReact Queryキャッシュキー
 *
 * リンク機能に関連するクエリキーを管理します。
 *
 * @example
 * ```ts
 * // リンク一覧取得（フィルタなし）
 * useInfiniteQuery({ queryKey: linkQueryKeys.list(), ... });
 *
 * // フィルタ付きリンク一覧取得
 * useInfiniteQuery({ queryKey: linkQueryKeys.list({ status: "keep" }), ... });
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
   * リンク一覧のクエリキー（無限スクロール用、フィルタパラメータ対応）
   * @param params - フィルタパラメータ（status, isRead）
   */
  list: (params?: Omit<LinkFilterParams, "limit">) =>
    params
      ? ([...linkQueryKeys.lists(), "infinite", params] as const)
      : ([...linkQueryKeys.lists(), "infinite"] as const),

  /**
   * 制限付きリンク一覧のクエリキー（単一ページ取得用）
   * @param params - フィルタパラメータ（status, isRead, limit）
   */
  listLimited: (params: LinkFilterParams) =>
    [...linkQueryKeys.lists(), "limited", params] as const,

  /**
   * リンク詳細の基底キー
   */
  details: () => [...linkQueryKeys.all, "detail"] as const,

  /**
   * 特定リンク詳細のクエリキー
   * @param id - リンクID
   */
  detail: (id: string) => [...linkQueryKeys.details(), id] as const,

  /**
   * OGPメタデータの基底キー
   */
  ogp: () => [...linkQueryKeys.all, "ogp"] as const,

  /**
   * 特定URLのOGPメタデータのクエリキー
   * @param url - 正規化されたURL
   */
  ogpMetadata: (url: string) => [...linkQueryKeys.ogp(), url] as const,
} as const;
