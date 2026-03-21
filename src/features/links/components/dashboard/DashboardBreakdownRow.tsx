import { Text, View } from "react-native";

import type {
  DashboardChartSeriesMode,
  DashboardCollectionStat,
  DashboardTableViewMode,
} from "@/src/features/links/types/dashboard.types";

export function DashboardBreakdownRow(props: {
  row: DashboardCollectionStat;
  index: number;
  rowCount: number;
  chartSeriesMode: DashboardChartSeriesMode;
  tableView: DashboardTableViewMode;
}) {
  const { row, index, rowCount, chartSeriesMode, tableView } = props;
  const count =
    chartSeriesMode === "added"
      ? row.addedCount
      : chartSeriesMode === "read"
        ? row.readCount
        : null;
  const emoji =
    tableView === "collection" ? (row.emoji ?? "📁") : (row.emoji ?? "🌐");
  const showDivider = index < rowCount - 1;
  const a11yCounts =
    chartSeriesMode === "both"
      ? `${row.addedCount} ${row.readCount}`
      : String(count);

  return (
    <View
      accessibilityLabel={`${row.name}, ${a11yCounts}`}
      accessible
      className={`min-h-[52px] w-full flex-row items-center gap-3 px-3 py-2.5 ${
        showDivider ? "border-b border-slate-100" : ""
      }`}
    >
      <Text
        accessibilityElementsHidden
        className="w-8 text-center text-xl leading-none"
      >
        {emoji}
      </Text>
      <Text
        accessibilityElementsHidden
        className="min-w-0 flex-1 text-base leading-snug text-slate-900"
        numberOfLines={2}
      >
        {row.name}
      </Text>
      {chartSeriesMode === "both" ? (
        <View className="w-[8.5rem] shrink-0 flex-row justify-end gap-2">
          <Text
            accessibilityElementsHidden
            className="w-16 text-right text-base font-semibold tabular-nums text-slate-900"
          >
            {row.addedCount}
          </Text>
          <Text
            accessibilityElementsHidden
            className="w-16 text-right text-base font-semibold tabular-nums text-slate-900"
          >
            {row.readCount}
          </Text>
        </View>
      ) : (
        <Text
          accessibilityElementsHidden
          className="w-16 shrink-0 text-right text-base font-semibold tabular-nums text-slate-900"
        >
          {count}
        </Text>
      )}
    </View>
  );
}
