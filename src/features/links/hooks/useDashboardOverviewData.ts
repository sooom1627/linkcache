import { useMemo } from "react";

import { useTranslation } from "react-i18next";

import { useCollections } from "@/src/features/links/hooks/useCollections";
import { useDashboardOverviewQuery } from "@/src/features/links/hooks/useDashboardOverviewQuery";
import type { DashboardCollectionStat } from "@/src/features/links/types/dashboard.types";

type BucketRow = { id: string; name: string; emoji: string | null };

type DailyTotalRow = { date: string; added_count: number; read_count: number };
type DailyByCollectionRow = {
  date: string;
  collection_id: string;
  added_count: number;
  read_count: number;
};
type DailyByDomainRow = {
  date: string;
  domain: string;
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

function domainDisplayName(
  domainKey: string,
  labels: { unknown: string; other: string },
): string {
  if (domainKey === "") {
    return labels.unknown;
  }
  if (domainKey === "__other__") {
    return labels.other;
  }
  return domainKey;
}

function buildDomainBreakdownFromRpc(
  dailyTotals: DailyTotalRow[] | null | undefined,
  dailyByDomain: DailyByDomainRow[] | null | undefined,
  labels: { unknown: string; other: string },
): {
  domainAddedStatsByDay: DashboardCollectionStat[][];
  domainReadStatsByDay: DashboardCollectionStat[][];
  domainStats: DashboardCollectionStat[];
} {
  const slotDates = effectiveSevenDayDates(dailyTotals);
  const rows = dailyByDomain ?? [];
  const dateToIndex = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const d = slotDates[i];
    if (d != null) {
      dateToIndex.set(d, i);
    }
  }

  const activityByDomain = new Map<string, { added: number; read: number }>();
  for (const row of rows) {
    if (dateToIndex.get(row.date) === undefined) {
      continue;
    }
    const cur = activityByDomain.get(row.domain) ?? { added: 0, read: 0 };
    cur.added += row.added_count;
    cur.read += row.read_count;
    activityByDomain.set(row.domain, cur);
  }

  const domainKeys = [...activityByDomain.keys()].sort((a, b) => {
    const ta = activityByDomain.get(a)!;
    const tb = activityByDomain.get(b)!;
    const sa = ta.added + ta.read;
    const sb = tb.added + tb.read;
    return sb - sa;
  });

  const domainBuckets: BucketRow[] = domainKeys.map((key) => ({
    id: key,
    name: domainDisplayName(key, labels),
    emoji: null,
  }));

  const n = domainBuckets.length;
  const addedByDayAndDomain: number[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: n }, () => 0),
  );
  const readByDayAndDomain: number[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: n }, () => 0),
  );

  for (const row of rows) {
    const dayIdx = dateToIndex.get(row.date);
    if (dayIdx === undefined) {
      continue;
    }
    const colIdx = domainBuckets.findIndex((c) => c.id === row.domain);
    if (colIdx === -1) {
      continue;
    }
    addedByDayAndDomain[dayIdx]![colIdx]! += row.added_count;
    readByDayAndDomain[dayIdx]![colIdx]! += row.read_count;
  }

  const domainAddedStatsByDay: DashboardCollectionStat[][] = [];
  const domainReadStatsByDay: DashboardCollectionStat[][] = [];
  for (let day = 0; day < 7; day++) {
    domainAddedStatsByDay.push(
      domainBuckets.map((c, j) => ({
        id: c.id,
        name: c.name,
        emoji: c.emoji,
        addedCount: addedByDayAndDomain[day]![j]!,
        readCount: 0,
      })),
    );
    domainReadStatsByDay.push(
      domainBuckets.map((c, j) => ({
        id: c.id,
        name: c.name,
        emoji: c.emoji,
        addedCount: 0,
        readCount: readByDayAndDomain[day]![j]!,
      })),
    );
  }

  const domainStats: DashboardCollectionStat[] = domainBuckets
    .map((c, j) => {
      let added = 0;
      let read = 0;
      for (let day = 0; day < 7; day++) {
        added += addedByDayAndDomain[day]![j]!;
        read += readByDayAndDomain[day]![j]!;
      }
      return {
        id: c.id,
        name: c.name,
        emoji: c.emoji,
        addedCount: added,
        readCount: read,
      };
    })
    .filter((r) => r.addedCount > 0 || r.readCount > 0);

  return {
    domainAddedStatsByDay,
    domainReadStatsByDay,
    domainStats,
  };
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

  const collectionStats: DashboardCollectionStat[] = collections
    .map((c, j) => {
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
    })
    .filter((r) => r.addedCount > 0 || r.readCount > 0);

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
  /** `orderBy: "items_count"` で一覧画面・モーダルと同一キーにし、タブ復帰時にキャッシュヒットさせる */
  const { collections, isLoading } = useCollections({
    orderBy: "items_count",
  });

  const domainLabels = useMemo(
    () => ({
      unknown: t("links.dashboard.domain_unknown"),
      other: t("links.dashboard.domain_other"),
    }),
    [t],
  );

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

  const collectionBuckets = useMemo(
    (): BucketRow[] =>
      collections.map((c) => ({
        id: c.id,
        name: c.name,
        emoji: c.emoji,
      })),
    [collections],
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

  const { domainStats, domainAddedStatsByDay, domainReadStatsByDay } = useMemo(
    () =>
      buildDomainBreakdownFromRpc(
        overviewData?.daily_totals,
        overviewData?.daily_by_domain,
        domainLabels,
      ),
    [overviewData?.daily_totals, overviewData?.daily_by_domain, domainLabels],
  );

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
    dashboardOverviewPending,
    dashboardOverviewFetching,
  };
}
