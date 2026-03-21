import { useState } from "react";

import type { LayoutChangeEvent } from "react-native";

import { act, renderHook } from "@testing-library/react-native";

import { useDashboardChartUi } from "@/src/features/links/hooks/useDashboardChartUi";
import { createMinimalOverviewData } from "@/src/features/links/testing/dashboardOverview.fixtures";
import type {
  DashboardChartSeriesMode,
  DashboardTableViewMode,
} from "@/src/features/links/types/dashboard.types";

import { wrapper } from "../test-utils";

function useChartHarness(data: ReturnType<typeof createMinimalOverviewData>) {
  const [chartSeriesMode, setChartSeriesMode] =
    useState<DashboardChartSeriesMode>("both");
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [tableView, setTableView] =
    useState<DashboardTableViewMode>("collection");

  const chart = useDashboardChartUi(
    data,
    chartSeriesMode,
    setChartSeriesMode,
    selectedDayIndex,
    setSelectedDayIndex,
    tableView,
  );

  return {
    chart,
    chartSeriesMode,
    setChartSeriesMode,
    selectedDayIndex,
    setSelectedDayIndex,
    tableView,
    setTableView,
  };
}

describe("useDashboardChartUi", () => {
  it("addedByDay / readByDay を週長にパディングして合計と stackData を導出する", () => {
    const data = createMinimalOverviewData({
      addedByDay: [1, 2, 3],
      readByDay: [0, 1, 0],
    });

    const { result } = renderHook(() => useChartHarness(data), { wrapper });

    expect(result.current.chart.totalAdded).toBe(6);
    expect(result.current.chart.totalRead).toBe(1);
    expect(result.current.chart.stackData).toHaveLength(7);
    expect(result.current.chart.stackData[0]?.stacks).toHaveLength(2);
  });

  it("toggleLegendSeries で both と単系列を切り替える", () => {
    const data = createMinimalOverviewData();

    const { result } = renderHook(() => useChartHarness(data), { wrapper });

    expect(result.current.chart.chartSeriesMode).toBe("both");

    act(() => {
      result.current.chart.toggleLegendSeries("added");
    });
    expect(result.current.chart.chartSeriesMode).toBe("added");
    expect(result.current.chart.stackData[0]?.stacks).toHaveLength(1);

    act(() => {
      result.current.chart.toggleLegendSeries("added");
    });
    expect(result.current.chart.chartSeriesMode).toBe("both");
  });

  it("日次スタッツが揃っているときバー押下で selectedDayIndex をトグルする", () => {
    const data = createMinimalOverviewData();
    const { result } = renderHook(() => useChartHarness(data), { wrapper });

    expect(result.current.chart.hasActiveDayStats).toBe(true);

    act(() => {
      result.current.chart.handleBarPress(null, 2);
    });
    expect(result.current.chart.selectedDayIndex).toBe(2);

    act(() => {
      result.current.chart.handleBarPress(null, 2);
    });
    expect(result.current.chart.selectedDayIndex).toBe(null);
  });

  it("日次コレクション配列が7日分でないときはバー押下を無視する", () => {
    const data = createMinimalOverviewData({
      collectionAddedStatsByDay: [[], [], []],
      collectionReadStatsByDay: [[], [], []],
    });

    const { result } = renderHook(() => useChartHarness(data), { wrapper });

    expect(result.current.chart.hasActiveDayStats).toBe(false);

    act(() => {
      result.current.chart.handleBarPress(null, 0);
    });
    expect(result.current.chart.selectedDayIndex).toBe(null);
  });

  it("onChartLayout で計測幅を反映して chartWidth に使う", () => {
    const data = createMinimalOverviewData();
    const { result } = renderHook(() => useChartHarness(data), { wrapper });

    expect(result.current.chart.chartWidth).toBeGreaterThanOrEqual(200);

    act(() => {
      result.current.chart.onChartLayout({
        nativeEvent: { layout: { width: 300, height: 120, x: 0, y: 0 } },
      } as LayoutChangeEvent);
    });

    expect(result.current.chart.chartWidth).toBe(300);
  });
});
