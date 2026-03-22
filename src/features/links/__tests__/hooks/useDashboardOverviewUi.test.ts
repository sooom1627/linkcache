import { act, renderHook } from "@testing-library/react-native";

import { useDashboardOverviewUi } from "@/src/features/links/hooks/useDashboardOverviewUi";
import { createMinimalOverviewData } from "@/src/features/links/testing/dashboardOverview.fixtures";

import { wrapper } from "../test-utils";

describe("useDashboardOverviewUi", () => {
  it("returns chart and breakdown with legend toggle keeping chartSeriesMode in sync", () => {
    const data = createMinimalOverviewData({
      addedByDay: [1, 0, 0, 0, 0, 0, 0],
      readByDay: [0, 0, 0, 0, 0, 0, 0],
    });

    const { result } = renderHook(() => useDashboardOverviewUi(data), {
      wrapper,
    });

    expect(result.current.chart.interaction.chartSeriesMode).toBe("both");
    expect(result.current.breakdown.chartSeriesMode).toBe("both");

    act(() => {
      result.current.chart.interaction.toggleLegendSeries("read");
    });

    expect(result.current.chart.interaction.chartSeriesMode).toBe("read");
    expect(result.current.breakdown.chartSeriesMode).toBe("read");
  });

  it("keeps bar selection and day breakdown in sync via shared orchestrator state", () => {
    const data = createMinimalOverviewData({
      addedByDay: [0, 2, 0, 0, 0, 0, 0],
      readByDay: [0, 0, 0, 0, 0, 0, 0],
    });

    const { result } = renderHook(() => useDashboardOverviewUi(data), {
      wrapper,
    });

    act(() => {
      result.current.chart.interaction.handleBarPress(null, 1);
    });

    expect(result.current.chart.interaction.selectedDayIndex).toBe(1);
    expect(result.current.breakdown.selectedDayIndex).toBe(1);
    expect(result.current.breakdown.showDayBreakdownCard).toBe(true);
  });

  it("syncs chartSeriesMode on chart and breakdown when toggling the read legend twice", () => {
    const data = createMinimalOverviewData({
      addedByDay: [1, 0, 0, 0, 0, 0, 0],
      readByDay: [0, 0, 0, 0, 0, 0, 0],
    });

    const { result } = renderHook(() => useDashboardOverviewUi(data), {
      wrapper,
    });

    expect(result.current.chart.interaction.chartSeriesMode).toBe("both");
    expect(result.current.breakdown.chartSeriesMode).toBe("both");

    act(() => {
      result.current.chart.interaction.toggleLegendSeries("read");
    });
    expect(result.current.chart.interaction.chartSeriesMode).toBe("read");
    expect(result.current.breakdown.chartSeriesMode).toBe("read");

    act(() => {
      result.current.chart.interaction.toggleLegendSeries("read");
    });
    expect(result.current.chart.interaction.chartSeriesMode).toBe("both");
    expect(result.current.breakdown.chartSeriesMode).toBe("both");
  });
});
