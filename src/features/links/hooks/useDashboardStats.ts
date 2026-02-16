import { useLinks } from "./useLinks";

/**
 * ダッシュボード統計情報フック
 *
 * ホーム画面のDashboardOverviewに表示する実データを取得します。
 * - inboxCount: 未整理リンク数（status="new"）
 * - allLinksCount: 全リンク数
 * - isLoading: いずれかのクエリがローディング中か
 */
export function useDashboardStats() {
  // 未整理リンク数（status="new"）
  const newLinksQuery = useLinks({ status: "new", limit: 1 });

  // 全リンク数
  const allLinksQuery = useLinks({ limit: 1 });

  return {
    inboxCount: newLinksQuery.totalCount,
    allLinksCount: allLinksQuery.totalCount,
    isLoading: newLinksQuery.isLoading || allLinksQuery.isLoading,
  };
}
