import {
  useCallback,
  useMemo,
  type Dispatch,
  type SetStateAction,
} from "react";

import { useTranslation } from "react-i18next";

import type { DashboardOverviewData } from "@/src/features/links/hooks/useDashboardOverviewData";
import type {
  DashboardChartSeriesMode,
  DashboardCollectionStat,
  DashboardTableViewMode,
} from "@/src/features/links/types/dashboard.types";
import { mergeAddedReadDayRows } from "@/src/features/links/utils/dashboardOverviewMerge";
import {
  getCalendarDateForDayIndex,
  padSeriesToWeek,
} from "@/src/features/links/utils/dashboardWeek";

type SetTableView = Dispatch<SetStateAction<DashboardTableViewMode>>;

export function useDashboardBreakdownUi(
  data: DashboardOverviewData,
  chartSeriesMode: DashboardChartSeriesMode,
  selectedDayIndex: number | null,
  tableView: DashboardTableViewMode,
  setTableView: SetTableView,
) {
  const { t, i18n } = useTranslation();

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

  const handleTableViewChange = useCallback(
    (v: DashboardTableViewMode) => setTableView(v),
    [setTableView],
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

  return {
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
  };
}
