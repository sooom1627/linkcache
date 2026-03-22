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

const CHART_PLACEHOLDER_SEVEN = [0, 0, 0, 0, 0, 0, 0];

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

  const collectionStats = useMemo(
    () =>
      collections.map((c) => {
        const n = c.itemsCount;
        const readCount = Math.floor(n * 0.45);
        return {
          id: c.id,
          name: c.name,
          emoji: c.emoji,
          addedCount: Math.max(0, n - readCount),
          readCount: Math.max(0, readCount),
        };
      }),
    [collections],
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

  const collectionAddedStatsByDay = useMemo((): DashboardCollectionStat[][] => {
    return mockAddedByDay.map((dayTotal): DashboardCollectionStat[] =>
      splitDayTotalAcrossBuckets(dayTotal, collectionBuckets, "added"),
    );
  }, [collectionBuckets]);

  const collectionReadStatsByDay = useMemo((): DashboardCollectionStat[][] => {
    return mockReadByDay.map((dayTotal): DashboardCollectionStat[] =>
      splitDayTotalAcrossBuckets(dayTotal, collectionBuckets, "read"),
    );
  }, [collectionBuckets]);

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
