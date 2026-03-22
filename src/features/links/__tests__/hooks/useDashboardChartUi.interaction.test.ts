import type { LayoutChangeEvent } from "react-native";

import { act, renderHook } from "@testing-library/react-native";

import { createMinimalOverviewData } from "@/src/features/links/testing/dashboardOverview.fixtures";
import { useChartHarness } from "@/src/features/links/testing/useDashboardChartUi.harness";

import { wrapper } from "../test-utils";

describe("useDashboardChartUi", () => {
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
