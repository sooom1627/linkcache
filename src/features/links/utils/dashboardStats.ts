import { extractDomain } from "@/src/features/links/hooks/useLinkPaste";
import type { DashboardCollectionStat } from "@/src/features/links/types/dashboard.types";
import type { UserLink } from "@/src/features/links/types/linkList.types";

/** 直近7日のモック（古い日 → 今日）— 接続後は API の時系列に差し替え */
export const mockAddedByDay: number[] = [1, 0, 2, 3, 2, 4, 5];
export const mockReadByDay: number[] = [0, 1, 1, 2, 2, 3, 4];

const DOMAIN_EMOJI = "🌐";

type BucketRow = { id: string; name: string; emoji: string | null };

/** その日の追加 or 完了総数をバケット数で均等配分（端数は先頭から1ずつ） */
export function splitDayTotalAcrossBuckets(
  total: number,
  buckets: BucketRow[],
  mode: "added" | "read",
): DashboardCollectionStat[] {
  const n = buckets.length;
  if (n === 0 || total <= 0) return [];
  const base = Math.floor(total / n);
  const rem = total % n;
  return buckets.map((c, i) => {
    const v = base + (i < rem ? 1 : 0);
    return {
      id: c.id,
      name: c.name,
      emoji: c.emoji,
      addedCount: mode === "added" ? v : 0,
      readCount: mode === "read" ? v : 0,
    };
  });
}

export function buildDomainStatsFromLinks(
  links: UserLink[],
  unknownLabel: string,
): DashboardCollectionStat[] {
  const counts = new Map<string, number>();
  for (const link of links) {
    const raw = extractDomain(link.url);
    const key = raw || unknownLabel;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const rows: DashboardCollectionStat[] = [...counts.entries()].map(
    ([name, n]) => {
      const readCount = Math.floor(n * 0.45);
      return {
        id: `domain:${name}`,
        name,
        emoji: DOMAIN_EMOJI,
        addedCount: Math.max(0, n - readCount),
        readCount: Math.max(0, readCount),
      };
    },
  );
  rows.sort((a, b) => {
    const va = a.addedCount + a.readCount;
    const vb = b.addedCount + b.readCount;
    return vb - va;
  });
  return rows;
}
