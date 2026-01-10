import type { TriageStatus } from "../types/linkList.types";

export const statusStyles = {
  inbox: {
    badge: "bg-sky-100",
    text: "text-sky-600",
    icon: "#38bdf8", // sky-400
  },
  read_soon: {
    badge: "bg-emerald-100",
    text: "text-emerald-600",
    icon: "#34d399", // emerald-400
  },
  later: {
    badge: "bg-amber-100",
    text: "text-amber-600",
    icon: "#fbbf24", // amber-400
  },
  default: {
    badge: "bg-slate-100",
    text: "text-slate-500",
    icon: "#cbd5e1", // slate-300
  },
} as const;

/**
 * ステータスに応じたスタイル設定を取得
 */
export const getStatusStyle = (status: TriageStatus | null) => {
  return statusStyles[status || "default"] ?? statusStyles.default;
};
