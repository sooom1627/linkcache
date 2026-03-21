export interface DashboardCollectionStat {
  id: string;
  name: string;
  emoji: string | null;
  addedCount: number;
  readCount: number;
}

export type DashboardCollectionMetric = "added" | "read";

export type DashboardTableViewMode = "collection" | "domain";

export type DashboardChartSeriesMode = "both" | "added" | "read";
