import { Pressable, Text, View } from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import {
  ArrowRight,
  BookOpen,
  Layers,
  Link2,
  TrendingUp,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { colors } from "@/src/shared/constants/colors";

const CARD_STYLE = { borderCurve: "continuous" as const };

interface DashboardOverviewProps {
  inboxCount: number;
  readCount: number;
  allLinksCount: number;
}

/**
 * ダッシュボード概要セクション
 *
 * ホーム画面の上部に表示される統計情報とアクションを含むコンポーネント
 * - Inboxカード（未整理リンク数）
 * - 統計情報（週間読了数、全リンク数）
 *
 * デザイン: シャドウなし、borderCurve: continuous、グラデーションで奥行き
 */
export function DashboardOverview({
  inboxCount,
  readCount,
  allLinksCount,
}: DashboardOverviewProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View className="gap-3">
      <View className="h-[140px] flex-row gap-3">
        {/* Left: Inbox (Main Action) */}
        {inboxCount > 0 ? (
          <View className="flex-1">
            <View
              className="flex-1 overflow-hidden rounded-2xl border border-slate-900 shadow-none"
              style={CARD_STYLE}
            >
              <Pressable
                className="h-full justify-between p-5 active:scale-[0.98] active:opacity-95"
                onPress={() => router.push("/swipes")}
                accessibilityRole="button"
                accessibilityLabel={`${inboxCount} ${t("links.dashboard.unsorted_links")}, ${t("links.dashboard.start_triage")}`}
              >
                <LinearGradient
                  colors={["#0f172a", "#334155"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                />
                <View style={{ zIndex: 1 }}>
                  <View className="mb-3 self-start rounded-lg bg-white/10 p-2">
                    <Layers size={18} color="white" strokeWidth={2} />
                  </View>
                  <Text className="text-4xl font-bold tracking-tight text-white">
                    {inboxCount}
                  </Text>
                  <Text className="mt-0.5 text-xs font-medium text-slate-400">
                    {t("links.dashboard.unsorted_links")}
                  </Text>
                </View>
                <View className="z-10 flex-row items-center gap-2">
                  <Text className="text-sm font-semibold text-white">
                    {t("links.dashboard.start_triage")}
                  </Text>
                  <ArrowRight size={14} color="white" strokeWidth={2.5} />
                </View>
              </Pressable>
            </View>
          </View>
        ) : (
          <View
            className="flex-1 justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-none"
            style={CARD_STYLE}
          >
            <View>
              <View className="mb-3 self-start rounded-lg bg-emerald-50 p-2">
                <BookOpen size={18} color={colors.success} strokeWidth={2} />
              </View>
              <Text className="text-lg font-bold text-slate-900">
                {t("links.dashboard.all_caught_up")}
              </Text>
            </View>
            <Text className="text-xs text-slate-500">
              {t("links.dashboard.no_pending_links")}
            </Text>
          </View>
        )}

        {/* Right: Stats */}
        <View className="w-[42%] gap-2">
          <View className="flex-1">
            <View
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-none"
              style={CARD_STYLE}
            >
              <View className="absolute right-3 top-3 rounded-full bg-slate-50 p-2">
                <TrendingUp size={18} color={colors.icon} strokeWidth={2} />
              </View>
              <View>
                <Text className="text-2xl font-bold tabular-nums text-slate-900">
                  {readCount}
                </Text>
                <Text className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {t("links.dashboard.read_week")}
                </Text>
              </View>
            </View>
          </View>
          <View className="flex-1">
            <View
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-none"
              style={CARD_STYLE}
            >
              <View className="absolute right-3 top-3 rounded-full bg-slate-50 p-2">
                <Link2 size={18} color={colors.icon} strokeWidth={2} />
              </View>
              <View>
                <Text className="text-2xl font-bold tabular-nums text-slate-900">
                  {allLinksCount}
                </Text>
                <Text className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {t("links.dashboard.all_links")}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
