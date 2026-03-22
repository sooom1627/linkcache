import { act, renderHook } from "@testing-library/react-native";

import { createMinimalOverviewData } from "@/src/features/links/testing/dashboardOverview.fixtures";
import {
  row,
  useBreakdownHarness,
} from "@/src/features/links/testing/useDashboardBreakdownUi.harness";

import { wrapper } from "../test-utils";

describe("useDashboardBreakdownUi (loading)", () => {
  it("setTableView でドメイン表示に切り替え isTableLoading が domainsLoading を参照する", () => {
    const data = createMinimalOverviewData({
      domainStats: [row("d1", 1, 1)],
      collectionsLoading: true,
      domainsLoading: false,
    });

    const { result } = renderHook(() => useBreakdownHarness(data), { wrapper });

    expect(result.current.breakdown.isTableLoading).toBe(true);

    act(() => {
      result.current.breakdown.setTableView("domain");
    });

    expect(result.current.breakdown.isTableLoading).toBe(false);
    expect(result.current.breakdown.displayRows[0]?.id).toBe("d1");
  });

  it("collection タブで dashboardOverviewPending のとき isTableLoading が true（RPC 未確定）", () => {
    const data = createMinimalOverviewData({
      collectionsLoading: false,
      dashboardOverviewPending: true,
      collectionStats: [row("c1", 1, 1)],
    });

    const { result } = renderHook(() => useBreakdownHarness(data), { wrapper });

    expect(result.current.breakdown.isTableLoading).toBe(true);
  });

  it("domain タブでは isTableLoading が domainsLoading のみ（dashboardOverviewPending は無視）", () => {
    const data = createMinimalOverviewData({
      domainStats: [row("d1", 1, 1)],
      dashboardOverviewPending: true,
      domainsLoading: false,
      collectionsLoading: false,
    });

    const { result } = renderHook(() => useBreakdownHarness(data), { wrapper });

    act(() => {
      result.current.breakdown.setTableView("domain");
    });

    expect(result.current.breakdown.isTableLoading).toBe(false);
  });
});
