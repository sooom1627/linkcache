import { renderHook } from "@testing-library/react-native";

import { useDashboardOverviewData } from "@/src/features/links/hooks/useDashboardOverviewData";
import type { UseDashboardOverviewQueryReturn } from "@/src/features/links/hooks/useDashboardOverviewQuery";
import type { DashboardCollectionStat } from "@/src/features/links/types/dashboard.types";
import {
  mockAddedByDay,
  mockReadByDay,
} from "@/src/features/links/utils/dashboardStats";

jest.mock("@/src/features/links/hooks/useDashboardOverviewQuery", () => ({
  useDashboardOverviewQuery: jest.fn(),
}));
jest.mock("@/src/features/links/hooks/useCollections", () => ({
  useCollections: jest.fn(),
}));
jest.mock("@/src/features/links/hooks/useLinks", () => ({
  useLinks: jest.fn(),
}));

const mockUseDashboardOverviewQuery = (
  jest.requireMock("@/src/features/links/hooks/useDashboardOverviewQuery") as {
    useDashboardOverviewQuery: jest.Mock;
  }
).useDashboardOverviewQuery;

const mockUseCollections = (
  jest.requireMock("@/src/features/links/hooks/useCollections") as {
    useCollections: jest.Mock;
  }
).useCollections;

const mockUseLinks = (
  jest.requireMock("@/src/features/links/hooks/useLinks") as {
    useLinks: jest.Mock;
  }
).useLinks;

/** useDashboardOverviewQuery.test と同型の RPC 成功ペイロード */
const VALID_OVERVIEW = {
  daily_totals: [
    { date: "2025-03-16", added_count: 1, read_count: 0 },
    { date: "2025-03-17", added_count: 0, read_count: 2 },
    { date: "2025-03-18", added_count: 3, read_count: 1 },
    { date: "2025-03-19", added_count: 0, read_count: 0 },
    { date: "2025-03-20", added_count: 5, read_count: 4 },
    { date: "2025-03-21", added_count: 2, read_count: 2 },
    { date: "2025-03-22", added_count: 0, read_count: 1 },
  ],
  daily_by_collection: [] as unknown[],
  daily_by_domain: [] as unknown[],
};

const EXPECTED_ADDED_BY_DAY = VALID_OVERVIEW.daily_totals.map(
  (r) => r.added_count,
);
const EXPECTED_READ_BY_DAY = VALID_OVERVIEW.daily_totals.map(
  (r) => r.read_count,
);

function sumAdded(rows: DashboardCollectionStat[]) {
  return rows.reduce((s, r) => s + r.addedCount, 0);
}

function sumRead(rows: DashboardCollectionStat[]) {
  return rows.reduce((s, r) => s + r.readCount, 0);
}

type OverviewQueryReturn = UseDashboardOverviewQueryReturn;

function defaultQueryReturn(
  overrides: Partial<OverviewQueryReturn> = {},
): OverviewQueryReturn {
  return {
    data: VALID_OVERVIEW,
    isLoading: false,
    isPending: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
    ...overrides,
  };
}

describe("useDashboardOverviewData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDashboardOverviewQuery.mockReturnValue(defaultQueryReturn());
    mockUseCollections.mockReturnValue({
      collections: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
    mockUseLinks.mockReturnValue({
      links: [],
      isLoading: false,
      isFetchingNextPage: false,
      isError: false,
      error: null,
      hasNextPage: false,
      totalCount: 0,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
      isRefreshing: false,
    });
  });

  it("addedByDay / readByDay は get_dashboard_overview の daily_totals と一致する", () => {
    const { result } = renderHook(() => useDashboardOverviewData());

    expect(result.current.addedByDay).toEqual(EXPECTED_ADDED_BY_DAY);
    expect(result.current.readByDay).toEqual(EXPECTED_READ_BY_DAY);
  });

  it("コレクション日別内訳は mock 系列＋ split のまま（RPC 系列と一致しないこともある）", () => {
    mockUseCollections.mockReturnValue({
      collections: [
        {
          id: "c1",
          name: "Work",
          emoji: "📁",
          itemsCount: 10,
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useDashboardOverviewData());

    for (let day = 0; day < 7; day += 1) {
      expect(sumAdded(result.current.collectionAddedStatsByDay[day]!)).toBe(
        mockAddedByDay[day],
      );
      expect(sumRead(result.current.collectionReadStatsByDay[day]!)).toBe(
        mockReadByDay[day],
      );
    }
  });

  it("overview の data が無い間はチャート系列を 7 日ゼロにする", () => {
    mockUseDashboardOverviewQuery.mockReturnValue(
      defaultQueryReturn({
        data: undefined,
        isLoading: true,
        isPending: true,
        isFetching: true,
      }),
    );

    const { result } = renderHook(() => useDashboardOverviewData());

    expect(result.current.addedByDay).toEqual([0, 0, 0, 0, 0, 0, 0]);
    expect(result.current.readByDay).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });

  it("daily_totals が空でもチャート系列は長さ 7（先頭ゼロ埋め）", () => {
    mockUseDashboardOverviewQuery.mockReturnValue(
      defaultQueryReturn({
        data: { ...VALID_OVERVIEW, daily_totals: [] },
      }),
    );

    const { result } = renderHook(() => useDashboardOverviewData());

    expect(result.current.addedByDay).toEqual([0, 0, 0, 0, 0, 0, 0]);
    expect(result.current.readByDay).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });

  it("daily_totals が 7 未満なら末尾最大 7 件を取り先頭をゼロ埋めして長さ 7 にする", () => {
    const partial = [
      { date: "2025-03-20", added_count: 5, read_count: 4 },
      { date: "2025-03-21", added_count: 2, read_count: 2 },
      { date: "2025-03-22", added_count: 0, read_count: 1 },
    ];
    mockUseDashboardOverviewQuery.mockReturnValue(
      defaultQueryReturn({
        data: { ...VALID_OVERVIEW, daily_totals: partial },
      }),
    );

    const { result } = renderHook(() => useDashboardOverviewData());

    expect(result.current.addedByDay).toEqual([0, 0, 0, 0, 5, 2, 0]);
    expect(result.current.readByDay).toEqual([0, 0, 0, 0, 4, 2, 1]);
  });

  it("daily_totals が 7 件を超える場合は末尾 7 件だけを使う", () => {
    const eight = [
      ...VALID_OVERVIEW.daily_totals,
      { date: "2025-03-23", added_count: 9, read_count: 8 },
    ];
    mockUseDashboardOverviewQuery.mockReturnValue(
      defaultQueryReturn({
        data: { ...VALID_OVERVIEW, daily_totals: eight },
      }),
    );

    const { result } = renderHook(() => useDashboardOverviewData());

    expect(result.current.addedByDay).toEqual([0, 3, 0, 5, 2, 0, 9]);
    expect(result.current.readByDay).toEqual([2, 1, 0, 4, 2, 1, 8]);
  });

  it("ダッシュ overview クエリの isPending / isFetching をそのまま返す", () => {
    mockUseDashboardOverviewQuery.mockReturnValue(
      defaultQueryReturn({
        isPending: true,
        isFetching: true,
        isLoading: true,
      }),
    );

    const { result } = renderHook(() => useDashboardOverviewData());

    expect(result.current.dashboardOverviewPending).toBe(true);
    expect(result.current.dashboardOverviewFetching).toBe(true);
  });

  it("データ取得済みでバックグラウンド再取得中は isPending false・isFetching true を返しうる", () => {
    mockUseDashboardOverviewQuery.mockReturnValue(
      defaultQueryReturn({
        isPending: false,
        isFetching: true,
        isLoading: false,
      }),
    );

    const { result } = renderHook(() => useDashboardOverviewData());

    expect(result.current.dashboardOverviewPending).toBe(false);
    expect(result.current.dashboardOverviewFetching).toBe(true);
  });
});
