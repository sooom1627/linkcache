import { useEffect } from "react";

import { View } from "react-native";

import { useTranslation } from "react-i18next";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/src/shared/constants/colors";

const CARD_STYLE = { borderCurve: "continuous" as const };
const CHART_AREA_HEIGHT = 128;
const BAR_HEIGHTS = [0.45, 0.65, 0.8, 0.5, 0.7, 0.55, 0.4] as const;
const TABLE_ROW_COUNT = 5;

const block = (w: `${number}%` | number, h: number) => ({
  width: w,
  height: h,
  borderRadius: 4,
  backgroundColor: colors.surfaceMutedActive,
});

/**
 * ダッシュボード概要の読み込みプレースホルダー（週次チャート + 内訳の形状に合わせる）
 */
export function DashboardOverviewSkeleton() {
  const { t } = useTranslation();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
    return () => {
      cancelAnimation(opacity);
    };
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View
      testID="dashboard-overview-skeleton"
      accessibilityLabel={t("links.dashboard.overview_loading_a11y")}
      accessibilityRole="progressbar"
      className="w-full gap-3"
    >
      <View
        className="overflow-hidden rounded-2xl bg-slate-100 p-3"
        style={CARD_STYLE}
      >
        <View className="mb-2 flex-row items-start justify-between gap-2">
          <Animated.View style={[animatedStyle, block("55%", 18)]} />
          <Animated.View style={[animatedStyle, block("28%", 14)]} />
        </View>
        <Animated.View
          style={[animatedStyle, block("42%", 12), { marginBottom: 6 }]}
        />
        <View
          className="flex-row items-end gap-1"
          style={{ height: CHART_AREA_HEIGHT }}
        >
          {BAR_HEIGHTS.map((ratio, index) => (
            <Animated.View
              key={index}
              style={[
                animatedStyle,
                {
                  flex: 1,
                  height: Math.round(CHART_AREA_HEIGHT * ratio),
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  backgroundColor: colors.surfaceMutedActive,
                },
              ]}
            />
          ))}
        </View>
        <View className="mt-3 flex-row flex-wrap justify-center gap-x-5 gap-y-2">
          <Animated.View style={[animatedStyle, block(140, 28)]} />
          <Animated.View style={[animatedStyle, block(140, 28)]} />
        </View>
      </View>

      <View
        className="overflow-hidden rounded-2xl bg-slate-100 p-3"
        style={CARD_STYLE}
      >
        <View className="flex-row items-center justify-between pb-2">
          <Animated.View style={[animatedStyle, block("48%", 18)]} />
          <View className="flex-row gap-2">
            <Animated.View style={[animatedStyle, block(72, 28)]} />
            <Animated.View style={[animatedStyle, block(72, 28)]} />
          </View>
        </View>

        <View className="mt-3 overflow-hidden rounded-xl border border-slate-200/90 bg-white">
          <View className="flex-row items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-3 py-2">
            <Animated.View style={[animatedStyle, block(32, 12)]} />
            <Animated.View
              style={[animatedStyle, { ...block("40%", 12), flex: 1 }]}
            />
            <Animated.View style={[animatedStyle, block(72, 12)]} />
          </View>
          {Array.from({ length: TABLE_ROW_COUNT }).map((_, index) => (
            <View
              key={index}
              className="flex-row items-center gap-3 border-b border-slate-50 px-3 py-2.5 last:border-b-0"
            >
              <Animated.View
                style={[
                  animatedStyle,
                  {
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    backgroundColor: colors.surfaceMutedActive,
                  },
                ]}
              />
              <Animated.View
                style={[animatedStyle, { ...block("50%", 14), flex: 1 }]}
              />
              <Animated.View style={[animatedStyle, block(40, 12)]} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
