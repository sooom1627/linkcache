import { View } from "react-native";

import Animated, { FadeIn } from "react-native-reanimated";

import { DashboardBreakdownSection } from "@/src/features/links/components/dashboard/DashboardBreakdownSection";
import { DashboardOverviewSkeleton } from "@/src/features/links/components/dashboard/DashboardOverviewSkeleton";
import { DashboardWeeklyActivityChart } from "@/src/features/links/components/dashboard/DashboardWeeklyActivityChart";
import { useDashboardOverviewData } from "@/src/features/links/hooks/useDashboardOverviewData";
import { useDashboardOverviewUi } from "@/src/features/links/hooks/useDashboardOverviewUi";

export type { DashboardCollectionStat } from "@/src/features/links/types/dashboard.types";

const CONTENT_FADE_MS = 280;
const CONTENT_STAGGER_MS = 80;

/**
 * ダッシュボード概要: 週次スタック棒 + コレクション／ドメイン内訳
 */
export function DashboardOverview() {
  const data = useDashboardOverviewData();
  const { chart, breakdown } = useDashboardOverviewUi(data);

  /**
   * Full-screen skeleton only while the overview RPC has no cached data.
   * Collections + `useLinks({ limit: 500 })` are gated separately:
   * - `invalidateQueries({ queryKey: linkQueryKeys.lists() })` also invalidates listLimited,
   *   so the 500-link query often refetches in the background and would keep the OR-gate true
   *   or block the chart even when overview + collections are already cached.
   * Breakdown uses `breakdown.isTableLoading` (collections / domains / overview pending per tab).
   */
  const isOverviewLoading = data.dashboardOverviewPending;

  const isDashboardRefetching =
    data.dashboardOverviewFetching && !data.dashboardOverviewPending;

  const showBreakdownSection =
    breakdown.selectedDayIndex === null || breakdown.showDayBreakdownCard;

  const chartAppearanceForChart = {
    palette: chart.appearance.palette,
    weekRangeLabel: chart.appearance.weekRangeLabel,
    chartWidth: chart.appearance.chartWidth,
    onChartLayout: chart.appearance.onChartLayout,
  };

  if (isOverviewLoading) {
    return <DashboardOverviewSkeleton />;
  }

  return (
    <View className="w-full gap-3">
      <Animated.View
        entering={FadeIn.duration(CONTENT_FADE_MS)}
        className="w-full"
      >
        <DashboardWeeklyActivityChart
          {...chartAppearanceForChart}
          {...chart.chartData}
          {...chart.interaction}
          {...chart.accessibility}
          isRefreshing={isDashboardRefetching}
        />
      </Animated.View>

      {showBreakdownSection ? (
        <Animated.View
          entering={FadeIn.duration(CONTENT_FADE_MS).delay(CONTENT_STAGGER_MS)}
          className="w-full"
        >
          <DashboardBreakdownSection
            chartSeriesMode={breakdown.chartSeriesMode}
            tableView={breakdown.tableView}
            onTableViewChange={breakdown.setTableView}
            selectedDayIndex={breakdown.selectedDayIndex}
            showDayBreakdownCard={breakdown.showDayBreakdownCard}
            selectedDayDateLabel={breakdown.selectedDayDateLabel}
            isTableLoading={breakdown.isTableLoading}
            emptyTableLabel={breakdown.emptyTableLabel}
            displayRows={breakdown.displayRows}
            sortedRowsLength={breakdown.sortedRowsLength}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}
