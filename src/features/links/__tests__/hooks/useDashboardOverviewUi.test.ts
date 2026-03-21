import { act, renderHook } from "@testing-library/react-native";

import { useDashboardOverviewUi } from "@/src/features/links/hooks/useDashboardOverviewUi";
import { createMinimalOverviewData } from "@/src/features/links/testing/dashboardOverview.fixtures";

import { wrapper } from "../test-utils";

describe("useDashboardOverviewUi", () => {
  it("chart と breakdown を返し、凡例トグルで両方の chartSeriesMode が同期する", () => {
    const data = createMinimalOverviewData({
      addedByDay: [1, 0, 0, 0, 0, 0, 0],
      readByDay: [0, 0, 0, 0, 0, 0, 0],
    });

    const { result } = renderHook(() => useDashboardOverviewUi(data), {
      wrapper,
    });

    expect(result.current.chart.chartSeriesMode).toBe("both");
    expect(result.current.breakdown.chartSeriesMode).toBe("both");

    act(() => {
      result.current.chart.toggleLegendSeries("read");
    });

    expect(result.current.chart.chartSeriesMode).toBe("read");
    expect(result.current.breakdown.chartSeriesMode).toBe("read");
  });

  it("オーケストレーター経由でバー選択と内訳表示が連動する", () => {
    const data = createMinimalOverviewData({
      addedByDay: [0, 2, 0, 0, 0, 0, 0],
      readByDay: [0, 0, 0, 0, 0, 0, 0],
    });

    const { result } = renderHook(() => useDashboardOverviewUi(data), {
      wrapper,
    });

    act(() => {
      result.current.chart.handleBarPress(null, 1);
    });

    expect(result.current.chart.selectedDayIndex).toBe(1);
    expect(result.current.breakdown.selectedDayIndex).toBe(1);
    expect(result.current.breakdown.showDayBreakdownCard).toBe(true);
  });
});
