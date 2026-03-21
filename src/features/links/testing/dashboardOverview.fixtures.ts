import type { DashboardOverviewData } from "@/src/features/links/hooks/useDashboardOverviewData";
import type { DashboardCollectionStat } from "@/src/features/links/types/dashboard.types";

export function createEmptySevenDayRowArrays(): DashboardCollectionStat[][] {
  return Array.from({ length: 7 }, () => []);
}

export function createMinimalOverviewData(
  overrides: Partial<DashboardOverviewData> = {},
): DashboardOverviewData {
  const emptySeven = createEmptySevenDayRowArrays();
  return {
    addedByDay: [0, 0, 0, 0, 0, 0, 0],
    readByDay: [0, 0, 0, 0, 0, 0, 0],
    collectionStats: [],
    collectionAddedStatsByDay: emptySeven,
    collectionReadStatsByDay: emptySeven,
    collectionsLoading: false,
    domainStats: [],
    domainAddedStatsByDay: emptySeven,
    domainReadStatsByDay: emptySeven,
    domainsLoading: false,
    ...overrides,
  };
}
