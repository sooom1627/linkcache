import type { DashboardChartSeriesMode } from "@/src/features/links/types/dashboard.types";

import { row } from "./useDashboardBreakdownUi.harness";

export type SortingCase = {
  label: string;
  mode: DashboardChartSeriesMode;
  stats: ReturnType<typeof row>[];
  expectedIds: string[];
  sortedRowsLength?: number;
};

export const sortingCases: SortingCase[] = [
  {
    label: "both",
    mode: "both",
    stats: [row("low", 1, 1), row("high", 2, 5)],
    expectedIds: ["high", "low"],
    sortedRowsLength: 2,
  },
  {
    label: "added",
    mode: "added",
    stats: [row("a", 10, 0), row("b", 2, 100)],
    expectedIds: ["a", "b"],
  },
  {
    label: "read",
    mode: "read",
    stats: [row("a", 100, 1), row("b", 0, 9)],
    expectedIds: ["b", "a"],
  },
];

export type WeeklyCase = {
  label: string;
  mode: DashboardChartSeriesMode;
  stats: ReturnType<typeof row>[];
  expectedIds: string[];
};

export const weeklyCases: WeeklyCase[] = [
  {
    label: "both で added/read とも 0 の行を除外",
    mode: "both",
    stats: [row("z", 0, 0), row("a", 1, 1)],
    expectedIds: ["a"],
  },
  {
    label: "added で read のみある行を除外",
    mode: "added",
    stats: [row("onlyRead", 0, 5), row("hasAdded", 1, 0)],
    expectedIds: ["hasAdded"],
  },
  {
    label: "read で added のみある行を除外",
    mode: "read",
    stats: [row("onlyAdded", 5, 0), row("hasRead", 0, 3)],
    expectedIds: ["hasRead"],
  },
];
