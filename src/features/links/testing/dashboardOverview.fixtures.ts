import type { DashboardOverviewData } from "@/src/features/links/hooks/useDashboardOverviewData";
import type { DashboardCollectionStat } from "@/src/features/links/types/dashboard.types";

export function createEmptySevenDayRowArrays(): DashboardCollectionStat[][] {
  return Array.from({ length: 7 }, () => []);
}

export function createMinimalOverviewData(
  overrides: Partial<DashboardOverviewData> = {},
): DashboardOverviewData {
  return {
    addedByDay: [0, 0, 0, 0, 0, 0, 0],
    readByDay: [0, 0, 0, 0, 0, 0, 0],
    collectionStats: [],
    collectionAddedStatsByDay: createEmptySevenDayRowArrays(),
    collectionReadStatsByDay: createEmptySevenDayRowArrays(),
    collectionsLoading: false,
    domainStats: [],
    domainAddedStatsByDay: createEmptySevenDayRowArrays(),
    domainReadStatsByDay: createEmptySevenDayRowArrays(),
    domainsLoading: false,
    dashboardOverviewPending: false,
    dashboardOverviewFetching: false,
    ...overrides,
  };
}
