import type { LayoutChangeEvent } from "react-native";
import { Pressable, Text, View } from "react-native";

import { useTranslation } from "react-i18next";
import { BarChart, yAxisSides } from "react-native-gifted-charts";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import type { DashboardChartSeriesMode } from "@/src/features/links/types/dashboard.types";
import { colors } from "@/src/shared/constants/colors";

const CARD_STYLE = { borderCurve: "continuous" as const };

const WEEKLY_CHART_HEIGHT = 128;

const CHART_MODE_FADE_MS = 220;

type ChartPalette = {
  readonly added: string;
  readonly read: string;
  readonly avgLine: string;
  readonly rule: string;
};

export function DashboardWeeklyActivityChart(props: {
  weekRangeLabel: string;
  chartWidth: number;
  onChartLayout: (e: LayoutChangeEvent) => void;
  stackData: {
    label: string;
    stacks: { value: number; color: string }[];
  }[];
  weeklyMax: number;
  chartHighlightActive: boolean;
  selectedDayIndex: number | null;
  handleBarPress: (item: unknown, index: number) => void;
  hasActiveDayStats: boolean;
  avgDailyTotal: number;
  chartAccessibilityLabel: string;
  toggleLegendSeries: (m: "added" | "read") => void;
  chartSeriesMode: DashboardChartSeriesMode;
  totalAdded: number;
  totalRead: number;
  addedLegendA11y: string;
  readLegendA11y: string;
  palette: ChartPalette;
}) {
  const { t } = useTranslation();
  const {
    weekRangeLabel,
    chartWidth,
    onChartLayout,
    stackData,
    weeklyMax,
    chartHighlightActive,
    selectedDayIndex,
    handleBarPress,
    hasActiveDayStats,
    avgDailyTotal,
    chartAccessibilityLabel,
    toggleLegendSeries,
    chartSeriesMode,
    totalAdded,
    totalRead,
    addedLegendA11y,
    readLegendA11y,
    palette,
  } = props;

  return (
    <View
      className="overflow-hidden rounded-2xl bg-slate-100 p-3"
      style={CARD_STYLE}
    >
      <View className="mb-2 flex-row items-start justify-between gap-2">
        <Text className="text-base font-semibold text-slate-800">
          {t("links.dashboard.chart_usage_title")}
        </Text>
        <Text
          className="max-w-[48%] text-right text-xs font-medium text-slate-600"
          numberOfLines={1}
        >
          {weekRangeLabel}
        </Text>
      </View>

      <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
        {t("links.dashboard.chart_weekly_section")}
      </Text>
      <View
        className="w-full"
        accessibilityLabel={chartAccessibilityLabel}
        accessibilityRole="image"
        accessible
        onLayout={onChartLayout}
      >
        <Animated.View
          key={chartSeriesMode}
          entering={FadeIn.duration(CHART_MODE_FADE_MS)}
          exiting={FadeOut.duration(CHART_MODE_FADE_MS)}
        >
          <BarChart
            width={chartWidth}
            height={WEEKLY_CHART_HEIGHT}
            parentWidth={chartWidth}
            adjustToWidth
            stackData={stackData}
            maxValue={weeklyMax}
            noOfSections={3}
            hideYAxisText
            yAxisLabelWidth={8}
            stackBorderTopLeftRadius={8}
            stackBorderTopRightRadius={8}
            xAxisThickness={0}
            yAxisThickness={0}
            yAxisSide={yAxisSides.RIGHT}
            yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 10 }}
            rulesColor={palette.rule}
            rulesType="solid"
            yAxisColor="transparent"
            xAxisColor="transparent"
            hideRules={false}
            isAnimated
            animationDuration={550}
            highlightEnabled={chartHighlightActive}
            highlightedBarIndex={
              chartHighlightActive && selectedDayIndex !== null
                ? selectedDayIndex
                : -1
            }
            onPress={hasActiveDayStats ? handleBarPress : undefined}
            showReferenceLine1
            referenceLine1Position={avgDailyTotal}
            referenceLine1Config={{
              color: palette.avgLine,
              thickness: 1,
              type: "dashed",
              dashWidth: 4,
              dashGap: 6,
              labelText: t("links.dashboard.chart_average_label"),
              labelTextStyle: {
                position: "absolute",
                right: 10,
                color: palette.avgLine,
                fontSize: 10,
                fontWeight: "600",
              },
            }}
          />
        </Animated.View>
      </View>

      <View className="mt-3 flex-row flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <Pressable
          accessibilityHint={t("links.dashboard.chart_legend_filter_hint")}
          accessibilityLabel={addedLegendA11y}
          accessibilityRole="button"
          accessibilityState={{ selected: chartSeriesMode === "added" }}
          onPress={() => toggleLegendSeries("added")}
          className={`flex-row items-center gap-2 rounded-lg px-2 py-1.5 active:opacity-80 ${
            chartSeriesMode === "added" ? "bg-white" : ""
          }`}
        >
          <View
            className="size-3 rounded-sm"
            style={{ backgroundColor: palette.added }}
          />
          <Text className="text-xs text-slate-600">
            {t("links.dashboard.chart_added_legend")}{" "}
            <Text className="font-semibold tabular-nums text-slate-800">
              {totalAdded}
            </Text>
          </Text>
        </Pressable>
        <Pressable
          accessibilityHint={t("links.dashboard.chart_legend_filter_hint")}
          accessibilityLabel={readLegendA11y}
          accessibilityRole="button"
          accessibilityState={{ selected: chartSeriesMode === "read" }}
          onPress={() => toggleLegendSeries("read")}
          className={`flex-row items-center gap-2 rounded-lg px-2 py-1.5 active:opacity-80 ${
            chartSeriesMode === "read" ? "bg-white" : ""
          }`}
        >
          <View
            className="size-3 rounded-sm"
            style={{ backgroundColor: palette.read }}
          />
          <Text className="text-xs text-slate-600">
            {t("links.dashboard.chart_read_legend")}{" "}
            <Text className="font-semibold tabular-nums text-slate-800">
              {totalRead}
            </Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
