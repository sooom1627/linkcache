import { useState } from "react";

import { act, renderHook } from "@testing-library/react-native";

import { useDashboardBreakdownUi } from "@/src/features/links/hooks/useDashboardBreakdownUi";
import {
  createEmptySevenDayRowArrays,
  createMinimalOverviewData,
} from "@/src/features/links/testing/dashboardOverview.fixtures";
import type {
  DashboardChartSeriesMode,
  DashboardCollectionStat,
  DashboardTableViewMode,
} from "@/src/features/links/types/dashboard.types";

import { wrapper } from "../test-utils";

const row = (
  id: string,
  addedCount: number,
  readCount: number,
): DashboardCollectionStat => ({
  id,
  name: id,
  emoji: null,
  addedCount,
  readCount,
});

function useBreakdownHarness(
  data: ReturnType<typeof createMinimalOverviewData>,
  initialMode: DashboardChartSeriesMode = "both",
  initialDay: number | null = null,
) {
  const [chartSeriesMode, setChartSeriesMode] =
    useState<DashboardChartSeriesMode>(initialMode);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(
    initialDay,
  );
  const [tableView, setTableView] =
    useState<DashboardTableViewMode>("collection");

  const breakdown = useDashboardBreakdownUi(
    data,
    chartSeriesMode,
    selectedDayIndex,
    tableView,
    setTableView,
  );

  return {
    breakdown,
    setChartSeriesMode,
    setSelectedDayIndex,
    setTableView,
  };
}

describe("useDashboardBreakdownUi", () => {
  it("chartSeriesMode に応じて sortedRows を並べ替える（both）", () => {
    const data = createMinimalOverviewData({
      collectionStats: [row("low", 1, 1), row("high", 2, 5)],
    });

    const { result } = renderHook(() => useBreakdownHarness(data, "both"), {
      wrapper,
    });

    expect(result.current.breakdown.displayRows.map((r) => r.id)).toEqual([
      "high",
      "low",
    ]);
    expect(result.current.breakdown.sortedRowsLength).toBe(2);
  });

  it("chartSeriesMode が added のときは addedCount で並べ替える", () => {
    const data = createMinimalOverviewData({
      collectionStats: [row("a", 10, 0), row("b", 2, 100)],
    });

    const { result } = renderHook(() => useBreakdownHarness(data, "added"), {
      wrapper,
    });

    expect(result.current.breakdown.displayRows.map((r) => r.id)).toEqual([
      "a",
      "b",
    ]);
  });

  it("chartSeriesMode が read のときは readCount で並べ替える", () => {
    const data = createMinimalOverviewData({
      collectionStats: [row("a", 100, 1), row("b", 0, 9)],
    });

    const { result } = renderHook(() => useBreakdownHarness(data, "read"), {
      wrapper,
    });

    expect(result.current.breakdown.displayRows.map((r) => r.id)).toEqual([
      "b",
      "a",
    ]);
  });

  it("選択日に加算があるとき displayRows は日別マージ行になる", () => {
    const seven = createEmptySevenDayRowArrays();
    seven[1] = [
      { id: "c1", name: "C", emoji: null, addedCount: 2, readCount: 0 },
    ];
    const sevenRead = createEmptySevenDayRowArrays();
    sevenRead[1] = [
      { id: "c1", name: "C", emoji: null, addedCount: 0, readCount: 1 },
    ];

    const data = createMinimalOverviewData({
      addedByDay: [0, 3, 0, 0, 0, 0, 0],
      readByDay: [0, 1, 0, 0, 0, 0, 0],
      collectionAddedStatsByDay: seven,
      collectionReadStatsByDay: sevenRead,
    });

    const { result } = renderHook(() => useBreakdownHarness(data, "both", 1), {
      wrapper,
    });

    expect(result.current.breakdown.showDayBreakdownCard).toBe(true);
    expect(result.current.breakdown.displayRows).toHaveLength(1);
    expect(result.current.breakdown.displayRows[0]).toMatchObject({
      id: "c1",
      addedCount: 2,
      readCount: 1,
    });
  });

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
});
