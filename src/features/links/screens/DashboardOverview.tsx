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

  const isOverviewLoading = data.collectionsLoading || data.domainsLoading;

  const showBreakdownSection =
    breakdown.selectedDayIndex === null || breakdown.showDayBreakdownCard;

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
          weekRangeLabel={chart.weekRangeLabel}
          chartWidth={chart.chartWidth}
          onChartLayout={chart.onChartLayout}
          stackData={chart.stackData}
          weeklyMax={chart.weeklyMax}
          chartHighlightActive={chart.chartHighlightActive}
          selectedDayIndex={chart.selectedDayIndex}
          handleBarPress={chart.handleBarPress}
          hasActiveDayStats={chart.hasActiveDayStats}
          avgDailyTotal={chart.avgDailyTotal}
          chartAccessibilityLabel={chart.chartAccessibilityLabel}
          toggleLegendSeries={chart.toggleLegendSeries}
          chartSeriesMode={chart.chartSeriesMode}
          totalAdded={chart.totalAdded}
          totalRead={chart.totalRead}
          addedLegendA11y={chart.addedLegendA11y}
          readLegendA11y={chart.readLegendA11y}
          palette={chart.palette}
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
