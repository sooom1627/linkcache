import type { LayoutChangeEvent } from "react-native";

import { act, renderHook } from "@testing-library/react-native";

import { createMinimalOverviewData } from "@/src/features/links/testing/dashboardOverview.fixtures";
import { useChartHarness } from "@/src/features/links/testing/useDashboardChartUi.harness";

import { wrapper } from "../test-utils";

describe("useDashboardChartUi", () => {
  it("toggles selectedDayIndex when daily stats are present on bar press", () => {
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

  it("ignores bar press when daily collection arrays are not seven days long", () => {
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

  it("applies measured width from onChartLayout to chartWidth", () => {
    const data = createMinimalOverviewData();
    const { result } = renderHook(() => useChartHarness(data), { wrapper });

    const initialWidth = result.current.chart.appearance.chartWidth;
    const nextLayoutWidth = initialWidth + 17;

    act(() => {
      result.current.chart.appearance.onChartLayout({
        nativeEvent: {
          layout: { width: nextLayoutWidth, height: 120, x: 0, y: 0 },
        },
      } as LayoutChangeEvent);
    });

    const updatedWidth = result.current.chart.appearance.chartWidth;
    expect(updatedWidth !== initialWidth || updatedWidth > initialWidth).toBe(
      true,
    );
  });
});
