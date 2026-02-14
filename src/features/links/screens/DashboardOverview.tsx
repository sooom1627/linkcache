import { useRouter } from "expo-router";

import { ArrowRight, BookOpen, Layers } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { colors } from "@/src/shared/constants/colors";
import { Pressable, Text, View } from "@/src/tw";

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
 * - Add New Linkボタン
 */
export function DashboardOverview({
  inboxCount,
  readCount,
  allLinksCount,
}: DashboardOverviewProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View>
      {/* Dashboard Grid */}
      <View className="mb-3 h-52 flex-row gap-3">
        {/* Left Column: Inbox (Main Action) */}
        {inboxCount > 0 ? (
          <Pressable
            className="bg-main-dark flex-1 justify-between rounded-xl p-5 active:scale-[0.98] active:opacity-95"
            onPress={() => router.push("/(protected)/(tabs)/(swipes)")}
            accessibilityRole="button"
            accessibilityLabel={`${inboxCount} ${t("links.dashboard.unsorted_links")}, ${t("links.dashboard.start_triage")}`}
          >
            <View>
              <View className="bg-main mb-4 self-start rounded-md p-2">
                <Layers size={20} color="white" />
              </View>
              <Text className="text-4xl font-bold tracking-tight text-white">
                {inboxCount}
              </Text>
              <Text className="mt-1 text-xs font-medium text-slate-400">
                {t("links.dashboard.unsorted_links")}
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-bold text-white">
                {t("links.dashboard.start_triage")}
              </Text>
              <ArrowRight size={16} color="white" />
            </View>
          </Pressable>
        ) : (
          <View className="flex-1 justify-between rounded-md border border-slate-200 bg-white p-5">
            <View>
              <View className="mb-4 self-start rounded-xl bg-emerald-50 p-2">
                <BookOpen size={20} color={colors.success} />
              </View>
              <Text className="text-xl font-bold text-slate-900">
                {t("links.dashboard.all_caught_up")}
              </Text>
            </View>
            <Text className="text-xs text-slate-500">
              {t("links.dashboard.no_pending_links")}
            </Text>
          </View>
        )}

        {/* Right Column: Stats */}
        <View className="w-[42%] gap-2">
          {/* Read Stats */}
          <View className="flex-1 justify-center rounded-lg border border-slate-200 bg-white px-4 py-3">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t("links.dashboard.read_week")}
            </Text>
            <Text className="mt-1 text-2xl font-bold text-slate-900">
              {readCount}
            </Text>
          </View>

          {/* All Links Stats */}
          <View className="flex-1 justify-center rounded-lg border border-slate-200 bg-white px-4 py-3">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t("links.dashboard.all_links")}
            </Text>
            <Text className="mt-1 text-2xl font-bold text-slate-900">
              {allLinksCount}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
