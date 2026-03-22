import { useMemo } from "react";

import { useTranslation } from "react-i18next";

import { useCollections } from "@/src/features/links/hooks/useCollections";
import { useDashboardOverviewQuery } from "@/src/features/links/hooks/useDashboardOverviewQuery";
import { useLinks } from "@/src/features/links/hooks/useLinks";
import type { DashboardCollectionStat } from "@/src/features/links/types/dashboard.types";
import {
  buildDomainStatsFromLinks,
  mockAddedByDay,
  mockReadByDay,
  splitDayTotalAcrossBuckets,
} from "@/src/features/links/utils/dashboardStats";

type BucketRow = { id: string; name: string; emoji: string | null };

type DailyTotalRow = { date: string; added_count: number; read_count: number };
type DailyByCollectionRow = {
  date: string;
  collection_id: string;
  added_count: number;
  read_count: number;
};

const CHART_PLACEHOLDER_SEVEN = [0, 0, 0, 0, 0, 0, 0];

/** Aligns with `normalizeSevenDaySeries`: index 0..6 matches chart slots; leading slots may have no RPC date. */
function effectiveSevenDayDates(
  dailyTotals: DailyTotalRow[] | null | undefined,
): (string | null)[] {
  const list = dailyTotals ?? [];
  const lastUpTo7 = list.slice(-7);
  const padCount = 7 - lastUpTo7.length;
  const dates = lastUpTo7.map((r) => r.date);
  const leadingNulls: (string | null)[] = Array.from(
    { length: padCount },
    () => null,
  );
  return [...leadingNulls, ...dates];
}

function buildCollectionBreakdownFromRpc(
  dailyTotals: DailyTotalRow[] | null | undefined,
  dailyByCollection: DailyByCollectionRow[] | null | undefined,
  collections: BucketRow[],
): {
  collectionAddedStatsByDay: DashboardCollectionStat[][];
  collectionReadStatsByDay: DashboardCollectionStat[][];
  collectionStats: DashboardCollectionStat[];
} {
  const slotDates = effectiveSevenDayDates(dailyTotals);
  const rows = dailyByCollection ?? [];
  const dateToIndex = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const d = slotDates[i];
    if (d != null) {
      dateToIndex.set(d, i);
    }
  }

  const n = collections.length;
  const addedByDayAndCollection: number[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: n }, () => 0),
  );
  const readByDayAndCollection: number[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: n }, () => 0),
  );

  for (const row of rows) {
    const dayIdx = dateToIndex.get(row.date);
    if (dayIdx === undefined) {
      continue;
    }
    const colIdx = collections.findIndex((c) => c.id === row.collection_id);
    if (colIdx === -1) {
      continue;
    }
    addedByDayAndCollection[dayIdx]![colIdx]! += row.added_count;
    readByDayAndCollection[dayIdx]![colIdx]! += row.read_count;
  }

  const collectionAddedStatsByDay: DashboardCollectionStat[][] = [];
  const collectionReadStatsByDay: DashboardCollectionStat[][] = [];
  for (let day = 0; day < 7; day++) {
    collectionAddedStatsByDay.push(
      collections.map((c, j) => ({
        id: c.id,
        name: c.name,
        emoji: c.emoji,
        addedCount: addedByDayAndCollection[day]![j]!,
        readCount: 0,
      })),
    );
    collectionReadStatsByDay.push(
      collections.map((c, j) => ({
        id: c.id,
        name: c.name,
        emoji: c.emoji,
        addedCount: 0,
        readCount: readByDayAndCollection[day]![j]!,
      })),
    );
  }

  const collectionStats: DashboardCollectionStat[] = collections.map((c, j) => {
    let added = 0;
    let read = 0;
    for (let day = 0; day < 7; day++) {
      added += addedByDayAndCollection[day]![j]!;
      read += readByDayAndCollection[day]![j]!;
    }
    return {
      id: c.id,
      name: c.name,
      emoji: c.emoji,
      addedCount: added,
      readCount: read,
    };
  });

  return {
    collectionAddedStatsByDay,
    collectionReadStatsByDay,
    collectionStats,
  };
}

function normalizeSevenDaySeries(
  rows: { added_count: number; read_count: number }[] | null | undefined,
  field: "added_count" | "read_count",
): number[] {
  const list = rows ?? [];
  const lastUpTo7 = list.slice(-7).map((r) => r[field]);
  const padCount = 7 - lastUpTo7.length;
  if (padCount <= 0) {
    return lastUpTo7;
  }
  return [...CHART_PLACEHOLDER_SEVEN.slice(0, padCount), ...lastUpTo7];
}

export interface DashboardOverviewData {
  addedByDay: number[];
  readByDay: number[];
  collectionStats: DashboardCollectionStat[];
  collectionAddedStatsByDay: DashboardCollectionStat[][];
  collectionReadStatsByDay: DashboardCollectionStat[][];
  collectionsLoading: boolean;
  domainStats: DashboardCollectionStat[];
  domainAddedStatsByDay: DashboardCollectionStat[][];
  domainReadStatsByDay: DashboardCollectionStat[][];
  domainsLoading: boolean;
  dashboardOverviewPending: boolean;
  dashboardOverviewFetching: boolean;
}

export function useDashboardOverviewData(): DashboardOverviewData {
  const { t } = useTranslation();
  const {
    data: overviewData,
    isPending: dashboardOverviewPending,
    isFetching: dashboardOverviewFetching,
  } = useDashboardOverviewQuery();
  const { collections, isLoading } = useCollections();
  const { links: linksForDomains, isLoading: domainsLoading } = useLinks({
    limit: 500,
    pageSize: 500,
  });

  const addedByDay = useMemo(
    (): number[] =>
      normalizeSevenDaySeries(overviewData?.daily_totals, "added_count"),
    [overviewData],
  );

  const readByDay = useMemo(
    (): number[] =>
      normalizeSevenDaySeries(overviewData?.daily_totals, "read_count"),
    [overviewData],
  );

  const domainStats = useMemo(
    () =>
      buildDomainStatsFromLinks(
        linksForDomains,
        t("links.dashboard.domain_unknown"),
      ),
    [linksForDomains, t],
  );

  const collectionBuckets = useMemo(
    (): BucketRow[] =>
      collections.map((c) => ({
        id: c.id,
        name: c.name,
        emoji: c.emoji,
      })),
    [collections],
  );

  const domainBuckets = useMemo(
    (): BucketRow[] =>
      domainStats.map((d) => ({
        id: d.id,
        name: d.name,
        emoji: d.emoji,
      })),
    [domainStats],
  );

  const {
    collectionStats,
    collectionAddedStatsByDay,
    collectionReadStatsByDay,
  } = useMemo(
    () =>
      buildCollectionBreakdownFromRpc(
        overviewData?.daily_totals,
        overviewData?.daily_by_collection,
        collectionBuckets,
      ),
    [
      overviewData?.daily_totals,
      overviewData?.daily_by_collection,
      collectionBuckets,
    ],
  );

  const domainAddedStatsByDay = useMemo((): DashboardCollectionStat[][] => {
    return mockAddedByDay.map((dayTotal): DashboardCollectionStat[] =>
      splitDayTotalAcrossBuckets(dayTotal, domainBuckets, "added"),
    );
  }, [domainBuckets]);

  const domainReadStatsByDay = useMemo((): DashboardCollectionStat[][] => {
    return mockReadByDay.map((dayTotal): DashboardCollectionStat[] =>
      splitDayTotalAcrossBuckets(dayTotal, domainBuckets, "read"),
    );
  }, [domainBuckets]);

  return {
    addedByDay,
    readByDay,
    collectionStats,
    collectionAddedStatsByDay,
    collectionReadStatsByDay,
    collectionsLoading: isLoading,
    domainStats,
    domainAddedStatsByDay,
    domainReadStatsByDay,
    domainsLoading,
    dashboardOverviewPending,
    dashboardOverviewFetching,
  };
}
