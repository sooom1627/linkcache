import { renderHook, waitFor } from "@testing-library/react-native";

import * as timezoneUtils from "@/src/shared/utils/timezone";

import { fetchCollections } from "../../api/fetchCollections.api";
import {
  fetchDashboardOverview,
  type DashboardOverviewRpcResult,
} from "../../api/fetchDashboardOverview.api";
import { linkQueryKeys } from "../../constants/queryKeys";
import { useDashboardOverviewData } from "../../hooks/useDashboardOverviewData";
import {
  dashboardTestCollectionPersonalId as C_PERSONAL,
  dashboardTestCollectionWorkId as C_WORK,
  dashboardTestCollectionsTwo as COLLECTIONS_TWO,
  expectedAddedByDayFromValidOverviewFixture as EXPECTED_ADDED_BY_DAY,
  expectedReadByDayFromValidOverviewFixture as EXPECTED_READ_BY_DAY,
  dashboardOverviewWithCollectionBreakdownRpcFixture as OVERVIEW_WITH_COLLECTION_BREAKDOWN,
  dashboardOverviewWithDomainBreakdownRpcFixture as OVERVIEW_WITH_DOMAIN_BREAKDOWN,
  dashboardOverviewValidRpcFixture as VALID_OVERVIEW,
} from "../../testing/dashboardOverview.fixtures";
import type { DashboardCollectionStat } from "../../types/dashboard.types";
import { clearQueryCache, testQueryClient, wrapper } from "../test-utils";

jest.mock("../../api/fetchDashboardOverview.api", () => ({
  fetchDashboardOverview: jest.fn(),
}));
jest.mock("../../api/fetchCollections.api", () => ({
  fetchCollections: jest.fn(),
}));

const mockFetchDashboardOverview = jest.mocked(fetchDashboardOverview);
const mockFetchCollections = jest.mocked(fetchCollections);

function sumAdded(rows: DashboardCollectionStat[]) {
  return rows.reduce((s, r) => s + r.addedCount, 0);
}

function sumRead(rows: DashboardCollectionStat[]) {
  return rows.reduce((s, r) => s + r.readCount, 0);
}

function addedFor(rows: DashboardCollectionStat[], id: string) {
  return rows.find((r) => r.id === id)?.addedCount ?? -1;
}

function readFor(rows: DashboardCollectionStat[], id: string) {
  return rows.find((r) => r.id === id)?.readCount ?? -1;
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

  it("コレクション日別内訳は daily_by_collection を useCollections 順でピボットする", async () => {
    mockFetchDashboardOverview.mockResolvedValue(
      OVERVIEW_WITH_COLLECTION_BREAKDOWN,
    );
    mockFetchCollections.mockResolvedValue(COLLECTIONS_TWO);

    const { result } = renderHook(() => useDashboardOverviewData(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.collectionAddedStatsByDay).toHaveLength(7);
    });

    const added = result.current.collectionAddedStatsByDay;
    const read = result.current.collectionReadStatsByDay;

    expect(added[0]!.map((r) => r.id)).toEqual([C_WORK, C_PERSONAL]);
    expect(addedFor(added[0]!, C_WORK)).toBe(2);
    expect(addedFor(added[0]!, C_PERSONAL)).toBe(0);
    expect(readFor(read[0]!, C_WORK)).toBe(1);
    expect(readFor(read[0]!, C_PERSONAL)).toBe(0);

    for (let d = 1; d <= 3; d += 1) {
      expect(sumAdded(added[d]!)).toBe(0);
      expect(sumRead(read[d]!)).toBe(0);
    }

    expect(addedFor(added[4]!, C_WORK)).toBe(1);
    expect(addedFor(added[4]!, C_PERSONAL)).toBe(3);
    expect(readFor(read[4]!, C_WORK)).toBe(0);
    expect(readFor(read[4]!, C_PERSONAL)).toBe(2);

    expect(sumAdded(added[5]!)).toBe(0);
    expect(sumAdded(added[6]!)).toBe(0);
  });

  it("collectionStats は 7 日分の daily_by_collection 合計（itemsCount を使わない）", async () => {
    mockFetchDashboardOverview.mockResolvedValue(
      OVERVIEW_WITH_COLLECTION_BREAKDOWN,
    );
    mockFetchCollections.mockResolvedValue(COLLECTIONS_TWO);

    const { result } = renderHook(() => useDashboardOverviewData(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.collectionStats).toHaveLength(2);
    });

    const work = result.current.collectionStats.find((r) => r.id === C_WORK);
    const personal = result.current.collectionStats.find(
      (r) => r.id === C_PERSONAL,
    );
    expect(work).toEqual({
      id: C_WORK,
      name: "Work",
      emoji: "📁",
      addedCount: 3,
      readCount: 1,
    });
    expect(personal).toEqual({
      id: C_PERSONAL,
      name: "Personal",
      emoji: "✨",
      addedCount: 3,
      readCount: 2,
    });
  });

  it("ドメイン内訳は daily_by_domain をピボットし 7 日合計活動量降順で列を並べる", async () => {
    mockFetchDashboardOverview.mockResolvedValue(
      OVERVIEW_WITH_DOMAIN_BREAKDOWN,
    );
    mockFetchCollections.mockResolvedValue([]);

    const { result } = renderHook(() => useDashboardOverviewData(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.domainStats).toHaveLength(4);
    });

    expect(result.current.domainStats.map((r) => r.id)).toEqual([
      "a.com",
      "b.com",
      "__other__",
      "",
    ]);

    const a = result.current.domainStats.find((r) => r.id === "a.com");
    const b = result.current.domainStats.find((r) => r.id === "b.com");
    const other = result.current.domainStats.find((r) => r.id === "__other__");
    const unknown = result.current.domainStats.find((r) => r.id === "");
    expect(a).toMatchObject({
      id: "a.com",
      name: "a.com",
      addedCount: 10,
      readCount: 0,
      emoji: null,
    });
    expect(b).toMatchObject({
      id: "b.com",
      name: "b.com",
      addedCount: 3,
      readCount: 1,
      emoji: null,
    });
    expect(other).toMatchObject({
      id: "__other__",
      name: "links.dashboard.domain_other",
      addedCount: 0,
      readCount: 2,
      emoji: null,
    });
    expect(unknown).toMatchObject({
      id: "",
      name: "links.dashboard.domain_unknown",
      addedCount: 1,
      readCount: 0,
      emoji: null,
    });

    const added = result.current.domainAddedStatsByDay;
    const read = result.current.domainReadStatsByDay;

    expect(added[0]!.map((r) => r.id)).toEqual([
      "a.com",
      "b.com",
      "__other__",
      "",
    ]);
    expect(addedFor(added[0]!, "b.com")).toBe(1);
    expect(addedFor(added[4]!, "a.com")).toBe(10);
    expect(addedFor(added[4]!, "b.com")).toBe(2);
    expect(readFor(read[4]!, "b.com")).toBe(1);
    expect(addedFor(added[5]!, "")).toBe(1);
    expect(readFor(read[6]!, "__other__")).toBe(2);
  });

  it("overview pending 中はコレクション日別をゼロで埋め、collectionStats は活動ゼロ行を除外して空", async () => {
    mockFetchDashboardOverview.mockImplementation(() => new Promise(() => {}));
    mockFetchCollections.mockResolvedValue(COLLECTIONS_TWO);

    const { result } = renderHook(() => useDashboardOverviewData(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.collectionsLoading).toBe(false);
    });

    expect(result.current.collectionAddedStatsByDay).toHaveLength(7);
    expect(result.current.collectionReadStatsByDay).toHaveLength(7);
    for (let day = 0; day < 7; day += 1) {
      expect(result.current.collectionAddedStatsByDay[day]).toEqual([
        {
          id: C_WORK,
          name: "Work",
          emoji: "📁",
          addedCount: 0,
          readCount: 0,
        },
        {
          id: C_PERSONAL,
          name: "Personal",
          emoji: "✨",
          addedCount: 0,
          readCount: 0,
        },
      ]);
      expect(result.current.collectionReadStatsByDay[day]).toEqual([
        {
          id: C_WORK,
          name: "Work",
          emoji: "📁",
          addedCount: 0,
          readCount: 0,
        },
        {
          id: C_PERSONAL,
          name: "Personal",
          emoji: "✨",
          addedCount: 0,
          readCount: 0,
        },
      ]);
    }
    expect(result.current.collectionStats).toEqual([]);
    expect(result.current.domainAddedStatsByDay).toEqual([
      [],
      [],
      [],
      [],
      [],
      [],
      [],
    ]);
    expect(result.current.domainReadStatsByDay).toEqual([
      [],
      [],
      [],
      [],
      [],
      [],
      [],
    ]);
    expect(result.current.domainStats).toEqual([]);
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
