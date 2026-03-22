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

    expect(result.current.chart.chartData.totalAdded).toBe(6);
    expect(result.current.chart.chartData.totalRead).toBe(1);
    expect(result.current.chart.chartData.stackData).toHaveLength(7);
    expect(result.current.chart.chartData.stackData[0]?.stacks).toHaveLength(2);
    expect(result.current.chart.chartData.showEmptyWeekHint).toBe(false);
  });

  it("週の added/read がすべて 0 のとき showEmptyWeekHint が true", () => {
    const data = createMinimalOverviewData();

    const { result } = renderHook(() => useChartHarness(data), { wrapper });

    expect(result.current.chart.chartData.totalAdded).toBe(0);
    expect(result.current.chart.chartData.totalRead).toBe(0);
    expect(result.current.chart.chartData.showEmptyWeekHint).toBe(true);
  });

  it("toggleLegendSeries で both と単系列を切り替える", () => {
    const data = createMinimalOverviewData();

    const { result } = renderHook(() => useChartHarness(data), { wrapper });

    expect(result.current.chart.interaction.chartSeriesMode).toBe("both");

    act(() => {
      result.current.chart.interaction.toggleLegendSeries("added");
    });
    expect(result.current.chart.interaction.chartSeriesMode).toBe("added");
    expect(result.current.chart.chartData.stackData[0]?.stacks).toHaveLength(1);

    act(() => {
      result.current.chart.interaction.toggleLegendSeries("added");
    });
    expect(result.current.chart.interaction.chartSeriesMode).toBe("both");
  });

  it("日次スタッツが揃っているときバー押下で selectedDayIndex をトグルする", () => {
    const data = createMinimalOverviewData();
    const { result } = renderHook(() => useChartHarness(data), { wrapper });

    expect(result.current.chart.interaction.hasActiveDayStats).toBe(true);

    act(() => {
      result.current.chart.interaction.handleBarPress(null, 2);
    });
    expect(result.current.chart.interaction.selectedDayIndex).toBe(2);

    act(() => {
      result.current.chart.interaction.handleBarPress(null, 2);
    });
    expect(result.current.chart.interaction.selectedDayIndex).toBe(null);
  });

  it("日次コレクション配列が7日分でないときはバー押下を無視する", () => {
    const data = createMinimalOverviewData({
      collectionAddedStatsByDay: [[], [], []],
      collectionReadStatsByDay: [[], [], []],
    });

    const { result } = renderHook(() => useChartHarness(data), { wrapper });

    expect(result.current.chart.interaction.hasActiveDayStats).toBe(false);

    act(() => {
      result.current.chart.interaction.handleBarPress(null, 0);
    });
    expect(result.current.chart.interaction.selectedDayIndex).toBe(null);
  });

  it("onChartLayout で計測幅を反映して chartWidth に使う", () => {
    const data = createMinimalOverviewData();
    const { result } = renderHook(() => useChartHarness(data), { wrapper });

    expect(result.current.chart.appearance.chartWidth).toBeGreaterThanOrEqual(
      200,
    );

    act(() => {
      result.current.chart.appearance.onChartLayout({
        nativeEvent: { layout: { width: 300, height: 120, x: 0, y: 0 } },
      } as LayoutChangeEvent);
    });

    expect(result.current.chart.appearance.chartWidth).toBe(300);
  });
});
