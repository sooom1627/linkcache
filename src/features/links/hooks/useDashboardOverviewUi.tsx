import { useState } from "react";

import { useDashboardBreakdownUi } from "@/src/features/links/hooks/useDashboardBreakdownUi";
import { useDashboardChartUi } from "@/src/features/links/hooks/useDashboardChartUi";
import type { DashboardOverviewData } from "@/src/features/links/hooks/useDashboardOverviewData";
import type {
  DashboardChartSeriesMode,
  DashboardTableViewMode,
} from "@/src/features/links/types/dashboard.types";

export function useDashboardOverviewUi(data: DashboardOverviewData) {
  const [chartSeriesMode, setChartSeriesMode] =
    useState<DashboardChartSeriesMode>("both");
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [tableView, setTableView] =
    useState<DashboardTableViewMode>("collection");

  const chart = useDashboardChartUi(
    data,
    chartSeriesMode,
    setChartSeriesMode,
    selectedDayIndex,
    setSelectedDayIndex,
    tableView,
  );

  const breakdown = useDashboardBreakdownUi(
    data,
    chartSeriesMode,
    selectedDayIndex,
    tableView,
    setTableView,
  );

  return { chart, breakdown };
}
