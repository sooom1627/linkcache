import { useCallback, useMemo, useState } from "react";

import { useWindowDimensions, type LayoutChangeEvent } from "react-native";

import { useTranslation } from "react-i18next";

import type { DashboardOverviewData } from "@/src/features/links/hooks/useDashboardOverviewData";
import type {
  DashboardChartSeriesMode,
  DashboardCollectionStat,
  DashboardTableViewMode,
} from "@/src/features/links/types/dashboard.types";
import {
  getCalendarDateForDayIndex,
  padSeriesToWeek,
} from "@/src/features/links/utils/dashboardWeek";
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

function mergeAddedReadDayRows(
  addedRows: DashboardCollectionStat[],
  readRows: DashboardCollectionStat[],
): DashboardCollectionStat[] {
  const map = new Map<string, DashboardCollectionStat>();
  for (const r of addedRows) {
    map.set(r.id, {
      id: r.id,
      name: r.name,
      emoji: r.emoji,
      addedCount: r.addedCount,
      readCount: 0,
    });
  }
  for (const r of readRows) {
    const existing = map.get(r.id);
    if (existing) {
      map.set(r.id, { ...existing, readCount: r.readCount });
    } else {
      map.set(r.id, {
        id: r.id,
        name: r.name,
        emoji: r.emoji,
        addedCount: 0,
        readCount: r.readCount,
      });
    }
  }
  return [...map.values()];
}

export function useDashboardOverviewUi(data: DashboardOverviewData) {
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
    collectionStats,
    collectionAddedStatsByDay,
    collectionReadStatsByDay,
    collectionsLoading,
    domainStats,
    domainAddedStatsByDay,
    domainReadStatsByDay,
    domainsLoading,
  } = data;

  const [chartInnerWidth, setChartInnerWidth] = useState(0);
  const [chartSeriesMode, setChartSeriesMode] =
    useState<DashboardChartSeriesMode>("both");
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [tableView, setTableView] =
    useState<DashboardTableViewMode>("collection");

  const handleTableViewChange = useCallback(
    (v: DashboardTableViewMode) => setTableView(v),
    [],
  );

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

  const toggleLegendSeries = useCallback((m: "added" | "read") => {
    setChartSeriesMode((prev) => (prev === m ? "both" : m));
  }, []);

  const chartWidth = useMemo(() => {
    if (chartInnerWidth > 0) return chartInnerWidth;
    return Math.max(200, screenWidth - 48);
  }, [chartInnerWidth, screenWidth]);

  const onChartLayout = useCallback((e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    if (w <= 0) return;
    setChartInnerWidth((prev) => (prev !== w ? w : prev));
  }, []);

  const activeStats =
    tableView === "collection" ? collectionStats : domainStats;

  const sortedRows = useMemo(() => {
    const rows = [...activeStats];
    rows.sort((a, b) => {
      if (chartSeriesMode === "both") {
        return b.addedCount + b.readCount - (a.addedCount + a.readCount);
      }
      if (chartSeriesMode === "added") {
        return b.addedCount - a.addedCount;
      }
      return b.readCount - a.readCount;
    });
    return rows;
  }, [activeStats, chartSeriesMode]);

  const sortedDayRows = useMemo(() => {
    if (selectedDayIndex === null || !hasActiveDayStats) {
      return [] as DashboardCollectionStat[];
    }
    if (chartSeriesMode === "both") {
      const addedDay =
        tableView === "collection"
          ? (collectionAddedStatsByDay[selectedDayIndex] ?? [])
          : (domainAddedStatsByDay[selectedDayIndex] ?? []);
      const readDay =
        tableView === "collection"
          ? (collectionReadStatsByDay[selectedDayIndex] ?? [])
          : (domainReadStatsByDay[selectedDayIndex] ?? []);
      return mergeAddedReadDayRows(addedDay, readDay)
        .filter((r) => r.addedCount > 0 || r.readCount > 0)
        .sort(
          (a, b) => b.addedCount + b.readCount - (a.addedCount + a.readCount),
        );
    }
    const day =
      chartSeriesMode === "added"
        ? tableView === "collection"
          ? (collectionAddedStatsByDay[selectedDayIndex] ?? [])
          : (domainAddedStatsByDay[selectedDayIndex] ?? [])
        : tableView === "collection"
          ? (collectionReadStatsByDay[selectedDayIndex] ?? [])
          : (domainReadStatsByDay[selectedDayIndex] ?? []);
    return [...day]
      .filter((r) =>
        chartSeriesMode === "added" ? r.addedCount > 0 : r.readCount > 0,
      )
      .sort((a, b) =>
        chartSeriesMode === "added"
          ? b.addedCount - a.addedCount
          : b.readCount - a.readCount,
      );
  }, [
    chartSeriesMode,
    collectionAddedStatsByDay,
    collectionReadStatsByDay,
    domainAddedStatsByDay,
    domainReadStatsByDay,
    hasActiveDayStats,
    selectedDayIndex,
    tableView,
  ]);

  const dayAddedTotal =
    selectedDayIndex !== null ? (added[selectedDayIndex] ?? 0) : null;
  const dayReadTotal =
    selectedDayIndex !== null ? (read[selectedDayIndex] ?? 0) : null;

  const selectedDayDateLabel = useMemo(() => {
    if (selectedDayIndex === null) return "";
    const date = getCalendarDateForDayIndex(selectedDayIndex);
    const fmt = new Intl.DateTimeFormat(i18n.language, {
      month: "short",
      day: "numeric",
    });
    return fmt.format(date);
  }, [selectedDayIndex, i18n.language]);

  const showDayBreakdownCard =
    selectedDayIndex !== null &&
    hasActiveDayStats &&
    (dayAddedTotal ?? 0) + (dayReadTotal ?? 0) > 0;

  const handleBarPress = useCallback(
    (_item: unknown, index: number) => {
      if (!hasActiveDayStats) return;
      setSelectedDayIndex((prev) => (prev === index ? null : index));
    },
    [hasActiveDayStats],
  );

  const chartHighlightActive = hasActiveDayStats && selectedDayIndex !== null;

  const isTableLoading =
    tableView === "collection" ? collectionsLoading : domainsLoading;

  const emptyTableLabel =
    tableView === "collection"
      ? t("links.dashboard.collections_empty")
      : t("links.dashboard.collections_empty_domains");

  const displayRows =
    selectedDayIndex !== null && showDayBreakdownCard
      ? sortedDayRows
      : sortedRows;

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
    chart: {
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
    },
    breakdown: {
      chartSeriesMode,
      tableView,
      setTableView: handleTableViewChange,
      selectedDayIndex,
      showDayBreakdownCard,
      selectedDayDateLabel,
      isTableLoading,
      emptyTableLabel,
      displayRows,
      sortedRowsLength: sortedRows.length,
    },
  };
}
