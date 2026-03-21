import { Text, View } from "react-native";

import { useTranslation } from "react-i18next";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { DashboardBreakdownRow } from "@/src/features/links/components/dashboard/DashboardBreakdownRow";
import { DashboardBreakdownToggleControls } from "@/src/features/links/components/dashboard/DashboardBreakdownToggleControls";
import type {
  DashboardChartSeriesMode,
  DashboardCollectionStat,
  DashboardTableViewMode,
} from "@/src/features/links/types/dashboard.types";
import { colors } from "@/src/shared/constants/colors";

const CARD_STYLE = { borderCurve: "continuous" as const };

const BRANCH_FADE_MS = 180;
const branchEntering = FadeIn.duration(BRANCH_FADE_MS);
const branchExiting = FadeOut.duration(BRANCH_FADE_MS);

export function DashboardBreakdownSection(props: {
  chartSeriesMode: DashboardChartSeriesMode;
  tableView: DashboardTableViewMode;
  onTableViewChange: (v: DashboardTableViewMode) => void;
  selectedDayIndex: number | null;
  showDayBreakdownCard: boolean;
  selectedDayDateLabel: string;
  isTableLoading: boolean;
  emptyTableLabel: string;
  displayRows: DashboardCollectionStat[];
  sortedRowsLength: number;
}) {
  const { t } = useTranslation();
  const {
    chartSeriesMode,
    tableView,
    onTableViewChange,
    selectedDayIndex,
    showDayBreakdownCard,
    selectedDayDateLabel,
    isTableLoading,
    emptyTableLabel,
    displayRows,
    sortedRowsLength,
  } = props;

  if (!(selectedDayIndex === null || showDayBreakdownCard)) {
    return null;
  }

  return (
    <View
      className="overflow-hidden rounded-2xl bg-slate-100 p-3"
      style={CARD_STYLE}
    >
      <View className="flex-row items-center justify-between pb-2">
        <Text className="text-base font-semibold text-slate-800">
          {t("links.dashboard.breakdown_header_title")}
        </Text>
        <DashboardBreakdownToggleControls
          tableView={tableView}
          onTableViewChange={onTableViewChange}
        />
      </View>

      <View className="mt-3 overflow-hidden rounded-xl border border-slate-200/90 bg-white">
        {selectedDayIndex !== null && showDayBreakdownCard ? (
          <Animated.View
            entering={branchEntering}
            exiting={branchExiting}
            className="flex-row border-b border-slate-100 bg-slate-50/90"
          >
            <View style={{ width: 3, backgroundColor: colors.accent }} />
            <View className="flex-1 justify-center px-3 py-2.5">
              <Text className="text-sm font-semibold text-slate-800">
                {t("links.dashboard.collections_day_selected_label", {
                  date: selectedDayDateLabel,
                })}
              </Text>
            </View>
          </Animated.View>
        ) : null}

        {isTableLoading ? (
          <Animated.View
            key="loading"
            entering={branchEntering}
            exiting={branchExiting}
            className="py-12"
          >
            <Text className="text-center text-sm text-slate-500">
              {t("links.dashboard.collections_loading")}
            </Text>
          </Animated.View>
        ) : selectedDayIndex === null && sortedRowsLength === 0 ? (
          <Animated.View
            key="empty"
            entering={branchEntering}
            exiting={branchExiting}
            className="py-12"
          >
            <Text className="text-center text-sm text-slate-500">
              {emptyTableLabel}
            </Text>
          </Animated.View>
        ) : (
          <Animated.View
            key="data"
            entering={branchEntering}
            exiting={branchExiting}
            className="w-full"
          >
            <Animated.View
              key={tableView}
              entering={branchEntering}
              exiting={branchExiting}
            >
              <View
                accessibilityRole="header"
                className="flex-row items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-3 py-2"
              >
                <View className="w-8" />
                <Text className="min-w-0 flex-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {tableView === "collection"
                    ? t("links.dashboard.collections_column_name")
                    : t("links.dashboard.collections_column_domain")}
                </Text>
                {chartSeriesMode === "both" ? (
                  <View className="w-[8.5rem] shrink-0 flex-row justify-end gap-2">
                    <Text className="w-16 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {t("links.dashboard.collections_metric_added")}
                    </Text>
                    <Text className="w-16 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {t("links.dashboard.collections_metric_read")}
                    </Text>
                  </View>
                ) : (
                  <Text className="w-16 shrink-0 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {chartSeriesMode === "added"
                      ? t("links.dashboard.collections_metric_added")
                      : t("links.dashboard.collections_metric_read")}
                  </Text>
                )}
              </View>
              {displayRows.map((row, index) => (
                <DashboardBreakdownRow
                  key={row.id}
                  row={row}
                  index={index}
                  rowCount={displayRows.length}
                  chartSeriesMode={chartSeriesMode}
                  tableView={tableView}
                />
              ))}
            </Animated.View>
          </Animated.View>
        )}
      </View>
    </View>
  );
}
