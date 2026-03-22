import { act, renderHook } from "@testing-library/react-native";

import { createMinimalOverviewData } from "@/src/features/links/testing/dashboardOverview.fixtures";
import { useChartHarness } from "@/src/features/links/testing/useDashboardChartUi.harness";

import { wrapper } from "../test-utils";

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

  it("showEmptyWeekHint is true when week's added/read are all zero", () => {
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
});
