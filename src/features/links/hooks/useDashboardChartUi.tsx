import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { useWindowDimensions, type LayoutChangeEvent } from "react-native";

import { useTranslation } from "react-i18next";

import type { DashboardOverviewData } from "@/src/features/links/hooks/useDashboardOverviewData";
import type {
  DashboardChartSeriesMode,
  DashboardTableViewMode,
} from "@/src/features/links/types/dashboard.types";
import { padSeriesToWeek } from "@/src/features/links/utils/dashboardWeek";
import { colors } from "@/src/shared/constants/colors";
import {
  formatWeekRangeLabel,
  getEnglishWeekdayLetterLabels,
} from "@/src/shared/utils/weekRangeDisplay";

const CHART_COLORS = {
  added: colors.accent,
  read: colors.main,
  avgLine: colors.success,
  rule: colors.border,
} as const;

type SetChartSeriesMode = Dispatch<SetStateAction<DashboardChartSeriesMode>>;
type SetSelectedDayIndex = Dispatch<SetStateAction<number | null>>;

export function useDashboardChartUi(
  data: DashboardOverviewData,
  chartSeriesMode: DashboardChartSeriesMode,
  setChartSeriesMode: SetChartSeriesMode,
  selectedDayIndex: number | null,
  setSelectedDayIndex: SetSelectedDayIndex,
  tableView: DashboardTableViewMode,
) {
  const { t, i18n } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const weekdayLabels = useMemo(() => getEnglishWeekdayLetterLabels(), []);
  const weekRangeLabel = useMemo(
    () => formatWeekRangeLabel(i18n.language),
    [i18n.language],
  );

  const {
    addedByDay,
    readByDay,
    collectionAddedStatsByDay,
    collectionReadStatsByDay,
    domainAddedStatsByDay,
    domainReadStatsByDay,
  } = data;

  const [chartInnerWidth, setChartInnerWidth] = useState(0);

  const hasCollectionDayStats =
    Array.isArray(collectionAddedStatsByDay) &&
    collectionAddedStatsByDay.length === 7 &&
    Array.isArray(collectionReadStatsByDay) &&
    collectionReadStatsByDay.length === 7;

  const hasDomainDayStats =
    Array.isArray(domainAddedStatsByDay) &&
    domainAddedStatsByDay.length === 7 &&
    Array.isArray(domainReadStatsByDay) &&
    domainReadStatsByDay.length === 7;

  const hasActiveDayStats =
    tableView === "collection" ? hasCollectionDayStats : hasDomainDayStats;

  const added = useMemo(() => padSeriesToWeek(addedByDay), [addedByDay]);
  const read = useMemo(() => padSeriesToWeek(readByDay), [readByDay]);

  const dailyTotals = useMemo(
    () => added.map((a, i) => a + (read[i] ?? 0)),
    [added, read],
  );

  const dailyValuesForScale = useMemo(() => {
    if (chartSeriesMode === "both") return dailyTotals;
    if (chartSeriesMode === "added") return added;
    return read;
  }, [added, chartSeriesMode, dailyTotals, read]);

  const totalAdded = useMemo(() => added.reduce((s, v) => s + v, 0), [added]);
  const totalRead = useMemo(() => read.reduce((s, v) => s + v, 0), [read]);
  const totalAll = totalAdded + totalRead;

  const avgDailyTotal = useMemo(() => {
    const s = dailyValuesForScale.reduce((a, b) => a + b, 0);
    return s / 7;
  }, [dailyValuesForScale]);

  const weeklyMax = useMemo(() => {
    const peak = Math.max(0, ...dailyValuesForScale);
    return Math.max(4, Math.ceil(peak * 1.12) || 1);
  }, [dailyValuesForScale]);

  const stackData = useMemo(() => {
    if (chartSeriesMode === "both") {
      return weekdayLabels.map((label, i) => ({
        label,
        stacks: [
          { value: Math.max(0, added[i] ?? 0), color: CHART_COLORS.added },
          { value: Math.max(0, read[i] ?? 0), color: CHART_COLORS.read },
        ],
      }));
    }
    if (chartSeriesMode === "added") {
      return weekdayLabels.map((label, i) => ({
        label,
        stacks: [
          { value: Math.max(0, added[i] ?? 0), color: CHART_COLORS.added },
        ],
      }));
    }
    return weekdayLabels.map((label, i) => ({
      label,
      stacks: [{ value: Math.max(0, read[i] ?? 0), color: CHART_COLORS.read }],
    }));
  }, [added, chartSeriesMode, weekdayLabels, read]);

  const toggleLegendSeries = useCallback(
    (m: "added" | "read") => {
      setChartSeriesMode((prev) => (prev === m ? "both" : m));
    },
    [setChartSeriesMode],
  );

  const chartWidth = useMemo(() => {
    if (chartInnerWidth > 0) return chartInnerWidth;
    return Math.max(200, screenWidth - 48);
  }, [chartInnerWidth, screenWidth]);

  const onChartLayout = useCallback((e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    if (w <= 0) return;
    setChartInnerWidth((prev) => (prev !== w ? w : prev));
  }, []);

  const handleBarPress = useCallback(
    (_item: unknown, index: number) => {
      if (!hasActiveDayStats) return;
      setSelectedDayIndex((prev) => (prev === index ? null : index));
    },
    [hasActiveDayStats, setSelectedDayIndex],
  );

  const chartHighlightActive = hasActiveDayStats && selectedDayIndex !== null;

  const chartAccessibilityLabel = useMemo(() => {
    if (chartSeriesMode === "both") {
      return t("links.dashboard.chart_a11y_summary", {
        total: totalAll,
        added: totalAdded,
        done: totalRead,
      });
    }
    if (chartSeriesMode === "added") {
      return t("links.dashboard.chart_a11y_added_only", {
        total: totalAdded,
      });
    }
    return t("links.dashboard.chart_a11y_read_only", {
      total: totalRead,
    });
  }, [chartSeriesMode, t, totalAdded, totalAll, totalRead]);

  const addedLegendA11y = useMemo(
    () => `${t("links.dashboard.chart_added_legend")}: ${totalAdded}`,
    [t, totalAdded],
  );

  const readLegendA11y = useMemo(
    () => `${t("links.dashboard.chart_read_legend")}: ${totalRead}`,
    [t, totalRead],
  );

  return {
    palette: CHART_COLORS,
    weekRangeLabel,
    weekdayLabels,
    chartWidth,
    onChartLayout,
    stackData,
    weeklyMax,
    chartHighlightActive,
    selectedDayIndex,
    handleBarPress,
    hasActiveDayStats,
    avgDailyTotal,
    chartAccessibilityLabel,
    toggleLegendSeries,
    chartSeriesMode,
    totalAdded,
    totalRead,
    addedLegendA11y,
    readLegendA11y,
  };
}
