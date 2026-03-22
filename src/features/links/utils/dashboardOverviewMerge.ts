import type { DashboardCollectionStat } from "@/src/features/links/types/dashboard.types";

export function mergeAddedReadDayRows(
  addedRows: DashboardCollectionStat[],
  readRows: DashboardCollectionStat[],
): DashboardCollectionStat[] {
  const map = new Map<string, DashboardCollectionStat>();
  for (const r of addedRows) {
    map.set(r.id, {
      id: r.id,
      name: r.name,
      emoji: r.emoji,
      addedCount: r.addedCount,
      readCount: 0,
    });
  }
  for (const r of readRows) {
    const existing = map.get(r.id);
    if (existing) {
      map.set(r.id, { ...existing, readCount: r.readCount });
    } else {
      map.set(r.id, {
        id: r.id,
        name: r.name,
        emoji: r.emoji,
        addedCount: 0,
        readCount: r.readCount,
      });
    }
  }
  return [...map.values()];
}
