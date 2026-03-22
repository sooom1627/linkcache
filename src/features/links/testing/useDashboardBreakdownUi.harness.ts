import { useState } from "react";

import { useDashboardBreakdownUi } from "@/src/features/links/hooks/useDashboardBreakdownUi";
import { createMinimalOverviewData } from "@/src/features/links/testing/dashboardOverview.fixtures";
import type {
  DashboardChartSeriesMode,
  DashboardCollectionStat,
  DashboardTableViewMode,
} from "@/src/features/links/types/dashboard.types";

export const row = (
  id: string,
  addedCount: number,
  readCount: number,
): DashboardCollectionStat => ({
  id,
  name: id,
  emoji: null,
  addedCount,
  readCount,
});

export function useBreakdownHarness(
  data: ReturnType<typeof createMinimalOverviewData>,
  initialMode: DashboardChartSeriesMode = "both",
  initialDay: number | null = null,
) {
  const [chartSeriesMode, setChartSeriesMode] =
    useState<DashboardChartSeriesMode>(initialMode);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(
    initialDay,
  );
  const [tableView, setTableView] =
    useState<DashboardTableViewMode>("collection");

  const breakdown = useDashboardBreakdownUi(
    data,
    chartSeriesMode,
    selectedDayIndex,
    tableView,
    setTableView,
  );

  return {
    breakdown,
    setChartSeriesMode,
    setSelectedDayIndex,
    setTableView,
  };
}
