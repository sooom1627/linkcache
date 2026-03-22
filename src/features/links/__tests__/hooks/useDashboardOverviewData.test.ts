import { renderHook, waitFor } from "@testing-library/react-native";

import * as timezoneUtils from "@/src/shared/utils/timezone";

import { fetchCollections } from "../../api/fetchCollections.api";
import {
  fetchDashboardOverview,
  type DashboardOverviewRpcResult,
} from "../../api/fetchDashboardOverview.api";
import { fetchUserLinks } from "../../api/fetchLinks.api";
import { linkQueryKeys } from "../../constants/queryKeys";
import { useDashboardOverviewData } from "../../hooks/useDashboardOverviewData";
import type { DashboardCollectionStat } from "../../types/dashboard.types";
import { mockAddedByDay, mockReadByDay } from "../../utils/dashboardStats";
import { clearQueryCache, testQueryClient, wrapper } from "../test-utils";

jest.mock("../../api/fetchDashboardOverview.api", () => ({
  fetchDashboardOverview: jest.fn(),
}));
jest.mock("../../api/fetchCollections.api", () => ({
  fetchCollections: jest.fn(),
}));
jest.mock("../../api/fetchLinks.api", () => ({
  fetchUserLinks: jest.fn(),
}));

const mockFetchDashboardOverview = jest.mocked(fetchDashboardOverview);
const mockFetchCollections = jest.mocked(fetchCollections);
const mockFetchUserLinks = jest.mocked(fetchUserLinks);

/** useDashboardOverviewQuery.test と同型の RPC 成功ペイロード */
const VALID_OVERVIEW: DashboardOverviewRpcResult = {
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

const EXPECTED_ADDED_BY_DAY = VALID_OVERVIEW.daily_totals.map(
  (r) => r.added_count,
);
const EXPECTED_READ_BY_DAY = VALID_OVERVIEW.daily_totals.map(
  (r) => r.read_count,
);

const EMPTY_LINKS_PAGE = {
  data: [] as Awaited<ReturnType<typeof fetchUserLinks>>["data"],
  hasMore: false,
  totalCount: 0,
};

function sumAdded(rows: DashboardCollectionStat[]) {
  return rows.reduce((s, r) => s + r.addedCount, 0);
}

function sumRead(rows: DashboardCollectionStat[]) {
  return rows.reduce((s, r) => s + r.readCount, 0);
}

function dashboardOverviewKey() {
  return linkQueryKeys.dashboardOverview({ tz: "Asia/Tokyo" });
}

describe("useDashboardOverviewData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearQueryCache();
    jest
      .spyOn(timezoneUtils, "getDeviceTimezone")
      .mockReturnValue("Asia/Tokyo");

    mockFetchDashboardOverview.mockResolvedValue(VALID_OVERVIEW);
    mockFetchCollections.mockResolvedValue([]);
    mockFetchUserLinks.mockResolvedValue(EMPTY_LINKS_PAGE);
  });

  afterEach(() => {
    clearQueryCache();
    jest.restoreAllMocks();
  });

  it("addedByDay / readByDay は get_dashboard_overview の daily_totals と一致する", async () => {
    const { result } = renderHook(() => useDashboardOverviewData(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.addedByDay).toEqual(EXPECTED_ADDED_BY_DAY);
    });
    expect(result.current.readByDay).toEqual(EXPECTED_READ_BY_DAY);
  });

  it("コレクション日別内訳は mock 系列＋ split のまま（RPC 系列と一致しないこともある）", async () => {
    mockFetchCollections.mockResolvedValue([
      {
        id: "c1",
        name: "Work",
        emoji: "📁",
        itemsCount: 10,
      },
    ]);

    const { result } = renderHook(() => useDashboardOverviewData(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.collectionAddedStatsByDay).toHaveLength(7);
    });

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
    mockFetchDashboardOverview.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useDashboardOverviewData(), {
      wrapper,
    });

    expect(result.current.addedByDay).toEqual([0, 0, 0, 0, 0, 0, 0]);
    expect(result.current.readByDay).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });

  it("daily_totals が空でもチャート系列は長さ 7（先頭ゼロ埋め）", async () => {
    mockFetchDashboardOverview.mockResolvedValue({
      ...VALID_OVERVIEW,
      daily_totals: [],
    } as DashboardOverviewRpcResult);

    const { result } = renderHook(() => useDashboardOverviewData(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.addedByDay).toEqual([0, 0, 0, 0, 0, 0, 0]);
    });
    expect(result.current.readByDay).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });

  it("daily_totals が 7 未満なら末尾最大 7 件を取り先頭をゼロ埋めして長さ 7 にする", async () => {
    const partial = [
      { date: "2025-03-20", added_count: 5, read_count: 4 },
      { date: "2025-03-21", added_count: 2, read_count: 2 },
      { date: "2025-03-22", added_count: 0, read_count: 1 },
    ];
    mockFetchDashboardOverview.mockResolvedValue({
      ...VALID_OVERVIEW,
      daily_totals: partial,
    } as DashboardOverviewRpcResult);

    const { result } = renderHook(() => useDashboardOverviewData(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.addedByDay).toEqual([0, 0, 0, 0, 5, 2, 0]);
    });
    expect(result.current.readByDay).toEqual([0, 0, 0, 0, 4, 2, 1]);
  });

  it("daily_totals が 7 件を超える場合は末尾 7 件だけを使う", async () => {
    const eight = [
      ...VALID_OVERVIEW.daily_totals,
      { date: "2025-03-23", added_count: 9, read_count: 8 },
    ];
    mockFetchDashboardOverview.mockResolvedValue({
      ...VALID_OVERVIEW,
      daily_totals: eight,
    } as DashboardOverviewRpcResult);

    const { result } = renderHook(() => useDashboardOverviewData(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.addedByDay).toEqual([0, 3, 0, 5, 2, 0, 9]);
    });
    expect(result.current.readByDay).toEqual([2, 1, 0, 4, 2, 1, 8]);
  });

  it("ダッシュ overview クエリの isPending / isFetching をそのまま返す", () => {
    mockFetchDashboardOverview.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useDashboardOverviewData(), {
      wrapper,
    });

    expect(result.current.dashboardOverviewPending).toBe(true);
    expect(result.current.dashboardOverviewFetching).toBe(true);
  });

  it("データ取得済みでバックグラウンド再取得中は isPending false・isFetching true を返しうる", async () => {
    const { result } = renderHook(() => useDashboardOverviewData(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.dashboardOverviewPending).toBe(false);
    });

    const overviewQuery = testQueryClient
      .getQueryCache()
      .find({ queryKey: dashboardOverviewKey() });
    expect(overviewQuery).toBeDefined();

    let releaseHang: (() => void) | undefined;
    const hangPromise = new Promise<typeof VALID_OVERVIEW>((resolve) => {
      releaseHang = () => {
        resolve(VALID_OVERVIEW);
      };
    });
    mockFetchDashboardOverview.mockImplementation(() => hangPromise);

    void overviewQuery!.fetch();

    await waitFor(() => {
      expect(result.current.dashboardOverviewFetching).toBe(true);
      expect(result.current.dashboardOverviewPending).toBe(false);
    });

    releaseHang!();
    await waitFor(() => {
      expect(result.current.dashboardOverviewFetching).toBe(false);
    });
  });
});
