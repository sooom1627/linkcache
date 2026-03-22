import type { DashboardOverviewRpcResult } from "@/src/features/links/api/fetchDashboardOverview.api";
import type { DashboardOverviewData } from "@/src/features/links/hooks/useDashboardOverviewData";
import type { CollectionWithCount } from "@/src/features/links/types/collections.types";
import type { DashboardCollectionStat } from "@/src/features/links/types/dashboard.types";

/** RPC success payload matching useDashboardOverviewData / useDashboardOverviewQuery tests (7-day daily_totals). */
export const dashboardOverviewValidRpcFixture: DashboardOverviewRpcResult = {
  daily_totals: [
    { date: "2025-03-16", added_count: 1, read_count: 0 },
    { date: "2025-03-17", added_count: 0, read_count: 2 },
    { date: "2025-03-18", added_count: 3, read_count: 1 },
    { date: "2025-03-19", added_count: 0, read_count: 0 },
    { date: "2025-03-20", added_count: 5, read_count: 4 },
    { date: "2025-03-21", added_count: 2, read_count: 2 },
    { date: "2025-03-22", added_count: 0, read_count: 1 },
  ],
  daily_by_collection: [],
  daily_by_domain: [],
};

export const expectedAddedByDayFromValidOverviewFixture =
  dashboardOverviewValidRpcFixture.daily_totals.map((r) => r.added_count);
export const expectedReadByDayFromValidOverviewFixture =
  dashboardOverviewValidRpcFixture.daily_totals.map((r) => r.read_count);

/** B4 tests: two collections as returned by useCollections (Zod `.uuid()` compatible). */
export const dashboardTestCollectionWorkId =
  "11111111-1111-4111-8111-111111111111";
export const dashboardTestCollectionPersonalId =
  "22222222-2222-4222-8222-222222222222";
/** ID that appears only in RPC daily_by_collection and must not appear as a UI row (US-B §3). */
export const dashboardTestCollectionRpcOnlyId =
  "33333333-3333-4333-a333-333333333333";

export const dashboardTestCollectionsTwo: CollectionWithCount[] = [
  {
    id: dashboardTestCollectionWorkId,
    name: "Work",
    emoji: "📁",
    itemsCount: 10,
  },
  {
    id: dashboardTestCollectionPersonalId,
    name: "Personal",
    emoji: "✨",
    itemsCount: 5,
  },
];

/** Sparse daily_by_collection example (duplicate counting and RPC-only collection rows). */
export const dashboardOverviewWithCollectionBreakdownRpcFixture: DashboardOverviewRpcResult =
  {
    ...dashboardOverviewValidRpcFixture,
    daily_by_collection: [
      {
        date: "2025-03-16",
        collection_id: dashboardTestCollectionWorkId,
        added_count: 2,
        read_count: 1,
      },
      {
        date: "2025-03-20",
        collection_id: dashboardTestCollectionWorkId,
        added_count: 1,
        read_count: 0,
      },
      {
        date: "2025-03-20",
        collection_id: dashboardTestCollectionPersonalId,
        added_count: 3,
        read_count: 2,
      },
      {
        date: "2025-03-18",
        collection_id: dashboardTestCollectionRpcOnlyId,
        added_count: 99,
        read_count: 99,
      },
    ],
  };

/** US-C: sparse `daily_by_domain` aligned with `dashboardOverviewValidRpcFixture` dates (index 0 = 2025-03-16). */
export const dashboardOverviewWithDomainBreakdownRpcFixture: DashboardOverviewRpcResult =
  {
    ...dashboardOverviewValidRpcFixture,
    daily_by_domain: [
      { date: "2025-03-16", domain: "b.com", added_count: 1, read_count: 0 },
      { date: "2025-03-20", domain: "a.com", added_count: 10, read_count: 0 },
      { date: "2025-03-20", domain: "b.com", added_count: 2, read_count: 1 },
      {
        date: "2025-03-22",
        domain: "__other__",
        added_count: 0,
        read_count: 2,
      },
      { date: "2025-03-21", domain: "", added_count: 1, read_count: 0 },
    ],
  };

export function createEmptySevenDayRowArrays(): DashboardCollectionStat[][] {
  return Array.from({ length: 7 }, () => []);
}

/**
 * Minimal `DashboardOverviewData` before screen composition. When filling collection
 * breakdown by hand, keep `collectionStats` and the per-day matrices
 * (`collectionAddedStatsByDay` / `collectionReadStatsByDay`) semantically aligned so they
 * stay consistent with `useDashboardBreakdownUi` day selection.
 */
export function createMinimalOverviewData(
  overrides: Partial<DashboardOverviewData> = {},
): DashboardOverviewData {
  return {
    addedByDay: [0, 0, 0, 0, 0, 0, 0],
    readByDay: [0, 0, 0, 0, 0, 0, 0],
    collectionStats: [],
    collectionAddedStatsByDay: createEmptySevenDayRowArrays(),
    collectionReadStatsByDay: createEmptySevenDayRowArrays(),
    collectionsLoading: false,
    domainStats: [],
    domainAddedStatsByDay: createEmptySevenDayRowArrays(),
    domainReadStatsByDay: createEmptySevenDayRowArrays(),
    dashboardOverviewPending: false,
    dashboardOverviewFetching: false,
    ...overrides,
  };
}

/** `DashboardOverviewData` with collection breakdown rows on a single day index (breakdown UI tests). */
export function createMinimalOverviewDataForSelectedCollectionDay(options: {
  dayIndex: number;
  addedByDay: number[];
  readByDay: number[];
  addedRow: DashboardCollectionStat;
  readRow: DashboardCollectionStat;
}): DashboardOverviewData {
  const collectionAddedStatsByDay = createEmptySevenDayRowArrays();
  const collectionReadStatsByDay = createEmptySevenDayRowArrays();
  collectionAddedStatsByDay[options.dayIndex] = [options.addedRow];
  collectionReadStatsByDay[options.dayIndex] = [options.readRow];
  return createMinimalOverviewData({
    addedByDay: options.addedByDay,
    readByDay: options.readByDay,
    collectionAddedStatsByDay,
    collectionReadStatsByDay,
  });
}
