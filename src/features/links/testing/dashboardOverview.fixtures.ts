import type { DashboardOverviewRpcResult } from "@/src/features/links/api/fetchDashboardOverview.api";
import type { DashboardOverviewData } from "@/src/features/links/hooks/useDashboardOverviewData";
import type { CollectionWithCount } from "@/src/features/links/types/collections.types";
import type { DashboardCollectionStat } from "@/src/features/links/types/dashboard.types";

/** useDashboardOverviewData / useDashboardOverviewQuery テストと同型の RPC 成功ペイロード（7 日 daily_totals） */
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

/** B4 テスト: useCollections に並ぶ 2 コレクション（Zod `.uuid()` 互換） */
export const dashboardTestCollectionWorkId =
  "11111111-1111-4111-8111-111111111111";
export const dashboardTestCollectionPersonalId =
  "22222222-2222-4222-8222-222222222222";
/** RPC の daily_by_collection にのみ現れ、UI 行に出てはいけない ID（US-B §3） */
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

/** `daily_by_collection` 疎行列例（重複計上・RPC-only コレクション行を含む） */
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

export function createEmptySevenDayRowArrays(): DashboardCollectionStat[][] {
  return Array.from({ length: 7 }, () => []);
}

/**
 * 画面合成前の最小 `DashboardOverviewData`。コレクション内訳を手で埋める場合は
 * `collectionStats` と日別行列（`collectionAddedStatsByDay` / `collectionReadStatsByDay`）を
 * 同じ意味で揃えること（`useDashboardBreakdownUi` の日選択表示と食い違わないように）。
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
    domainsLoading: false,
    dashboardOverviewPending: false,
    dashboardOverviewFetching: false,
    ...overrides,
  };
}

/** 特定インデックスの日だけコレクション内訳行がある `DashboardOverviewData`（内訳 UI テスト用） */
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
