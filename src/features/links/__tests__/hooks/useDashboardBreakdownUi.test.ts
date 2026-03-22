import { renderHook } from "@testing-library/react-native";

import {
  createMinimalOverviewData,
  createMinimalOverviewDataForSelectedCollectionDay,
} from "@/src/features/links/testing/dashboardOverview.fixtures";
import { useBreakdownHarness } from "@/src/features/links/testing/useDashboardBreakdownUi.harness";
import {
  sortingCases,
  weeklyCases,
} from "@/src/features/links/testing/useDashboardBreakdownUi.testCases";

import { wrapper } from "../test-utils";

describe("useDashboardBreakdownUi", () => {
  it.each(sortingCases)(
    "chartSeriesMode が $label のとき displayRows を並べ替える",
    ({ mode, stats, expectedIds, sortedRowsLength }) => {
      const data = createMinimalOverviewData({ collectionStats: stats });
      const { result } = renderHook(() => useBreakdownHarness(data, mode), {
        wrapper,
      });
      expect(result.current.breakdown.displayRows.map((r) => r.id)).toEqual(
        expectedIds,
      );
      if (sortedRowsLength !== undefined) {
        expect(result.current.breakdown.sortedRowsLength).toBe(
          sortedRowsLength,
        );
      }
    },
  );

  it.each(weeklyCases)(
    "週次 Breakdown: $label",
    ({ mode, stats, expectedIds }) => {
      const data = createMinimalOverviewData({ collectionStats: stats });
      const { result } = renderHook(() => useBreakdownHarness(data, mode), {
        wrapper,
      });
      expect(result.current.breakdown.displayRows.map((r) => r.id)).toEqual(
        expectedIds,
      );
      expect(result.current.breakdown.sortedRowsLength).toBe(
        expectedIds.length,
      );
    },
  );

  it("選択日に加算があるとき displayRows は日別マージ行になる", () => {
    const data = createMinimalOverviewDataForSelectedCollectionDay({
      dayIndex: 1,
      addedByDay: [0, 3, 0, 0, 0, 0, 0],
      readByDay: [0, 1, 0, 0, 0, 0, 0],
      addedRow: {
        id: "c1",
        name: "C",
        emoji: null,
        addedCount: 2,
        readCount: 0,
      },
      readRow: {
        id: "c1",
        name: "C",
        emoji: null,
        addedCount: 0,
        readCount: 1,
      },
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
});
