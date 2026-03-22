import { renderHook, waitFor } from "@testing-library/react-native";

import * as timezoneUtils from "@/src/shared/utils/timezone";

import { fetchDashboardOverview } from "../../api/fetchDashboardOverview.api";
import { linkQueryKeys } from "../../constants/queryKeys";
import {
  dashboardOverviewStaleTimeMs,
  useDashboardOverviewQuery,
} from "../../hooks/useDashboardOverviewQuery";
import { clearQueryCache, testQueryClient, wrapper } from "../test-utils";

jest.mock("../../api/fetchDashboardOverview.api", () => ({
  fetchDashboardOverview: jest.fn(),
}));

const mockFetchDashboardOverview = jest.mocked(fetchDashboardOverview);

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

describe("useDashboardOverviewQuery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearQueryCache();
    jest
      .spyOn(timezoneUtils, "getDeviceTimezone")
      .mockReturnValue("Asia/Tokyo");
  });

  afterEach(() => {
    clearQueryCache();
    jest.restoreAllMocks();
  });

  it("fetchDashboardOverview を端末 TZ で呼び、data を返す", async () => {
    mockFetchDashboardOverview.mockResolvedValue(VALID_OVERVIEW);

    const { result } = renderHook(() => useDashboardOverviewQuery(), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetchDashboardOverview).toHaveBeenCalledWith("Asia/Tokyo");
    expect(result.current.data).toEqual(VALID_OVERVIEW);
    expect(result.current.isError).toBe(false);

    const queries = testQueryClient.getQueryCache().findAll({
      queryKey: linkQueryKeys.dashboardOverview({ tz: "Asia/Tokyo" }),
    });
    expect(queries).toHaveLength(1);
  });

  it("失敗時は isError と error を返す", async () => {
    mockFetchDashboardOverview.mockRejectedValue(new Error("RPC failed"));

    const { result } = renderHook(() => useDashboardOverviewQuery(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.error?.message).toBe("RPC failed");
  });

  it("overview クエリの staleTime が 5 分（仕様: ダッシュは数分キャッシュ）", async () => {
    mockFetchDashboardOverview.mockResolvedValue(VALID_OVERVIEW);

    renderHook(() => useDashboardOverviewQuery(), { wrapper });

    await waitFor(() => {
      expect(mockFetchDashboardOverview).toHaveBeenCalled();
    });

    const entry = testQueryClient.getQueryCache().find({
      queryKey: linkQueryKeys.dashboardOverview({ tz: "Asia/Tokyo" }),
    });

    expect(entry).toBeDefined();
    const staleTime = (entry!.options as { staleTime: number }).staleTime;
    expect(staleTime).toBe(dashboardOverviewStaleTimeMs);
  });
});
