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
  isValidAddedReadDayStatsPair,
  padSeriesToWeek,
} from "@/src/features/links/utils/dashboardWeek";

function pickAddedDayRows(
  tableView: DashboardTableViewMode,
  dayIndex: number,
  collectionAdded: DashboardCollectionStat[][],
  domainAdded: DashboardCollectionStat[][],
): DashboardCollectionStat[] {
  return tableView === "collection"
    ? (collectionAdded[dayIndex] ?? [])
    : (domainAdded[dayIndex] ?? []);
}

function pickReadDayRows(
  tableView: DashboardTableViewMode,
  dayIndex: number,
  collectionRead: DashboardCollectionStat[][],
  domainRead: DashboardCollectionStat[][],
): DashboardCollectionStat[] {
  return tableView === "collection"
    ? (collectionRead[dayIndex] ?? [])
    : (domainRead[dayIndex] ?? []);
}

function compareDayRowsBySeriesMode(
  a: DashboardCollectionStat,
  b: DashboardCollectionStat,
  chartSeriesMode: DashboardChartSeriesMode,
): number {
  if (chartSeriesMode === "both") {
    return b.addedCount + b.readCount - (a.addedCount + a.readCount);
  }
  if (chartSeriesMode === "added") {
    return b.addedCount - a.addedCount;
  }
  return b.readCount - a.readCount;
}

function filterRowsWithActivity(
  rows: DashboardCollectionStat[],
  chartSeriesMode: DashboardChartSeriesMode,
): DashboardCollectionStat[] {
  if (chartSeriesMode === "both") {
    return rows.filter((r) => r.addedCount > 0 || r.readCount > 0);
  }
  if (chartSeriesMode === "added") {
    return rows.filter((r) => r.addedCount > 0);
  }
  return rows.filter((r) => r.readCount > 0);
}

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

  const hasCollectionDayStats = isValidAddedReadDayStatsPair(
    collectionAddedStatsByDay,
    collectionReadStatsByDay,
  );

  const hasDomainDayStats = isValidAddedReadDayStatsPair(
    domainAddedStatsByDay,
    domainReadStatsByDay,
  );

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
    const dayIndex = selectedDayIndex;

    if (chartSeriesMode === "both") {
      const addedDay = pickAddedDayRows(
        tableView,
        dayIndex,
        collectionAddedStatsByDay,
        domainAddedStatsByDay,
      );
      const readDay = pickReadDayRows(
        tableView,
        dayIndex,
        collectionReadStatsByDay,
        domainReadStatsByDay,
      );
      return filterRowsWithActivity(
        mergeAddedReadDayRows(addedDay, readDay),
        "both",
      ).sort((a, b) => compareDayRowsBySeriesMode(a, b, "both"));
    }

    const dayRows =
      chartSeriesMode === "added"
        ? pickAddedDayRows(
            tableView,
            dayIndex,
            collectionAddedStatsByDay,
            domainAddedStatsByDay,
          )
        : pickReadDayRows(
            tableView,
            dayIndex,
            collectionReadStatsByDay,
            domainReadStatsByDay,
          );

    return filterRowsWithActivity([...dayRows], chartSeriesMode).sort((a, b) =>
      compareDayRowsBySeriesMode(a, b, chartSeriesMode),
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
