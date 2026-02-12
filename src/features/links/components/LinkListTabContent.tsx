import { memo } from "react";

import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { Link, useRouter } from "expo-router";

import { ArrowRight, Layers2 } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { ErrorStateView } from "@/src/shared/components/ErrorStateView";
import { colors } from "@/src/shared/constants/colors";

import type { useLinks } from "../hooks/useLinks";
import type { TabType } from "../types/linkList.types";

import { LinkListCard } from "./LinkListCard";
import { LinkListEmpty } from "./LinkListEmpty";

interface LinkListTabContentProps {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  links: ReturnType<typeof useLinks>["links"];
  tabType: TabType;
}

/**
 * タブコンテンツコンポーネント
 */
export const LinkListTabContent = memo(function LinkListTabContent({
  isLoading,
  isError,
  error,
  links,
  tabType,
}: LinkListTabContentProps) {
  const { t } = useTranslation();
  const router = useRouter();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <ActivityIndicator size="large" color={colors.icon} />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <ErrorStateView
          message={error?.message || t("links.dashboard.error_load_failed")}
        />
      </View>
    );
  }

  if (links.length === 0) {
    // Read Soonタブの場合はTriageへ誘導するボタンを表示
    if (tabType === "read_soon") {
      return (
        <View className="mt-12 items-center px-8">
          <View className="mb-6 rounded-full bg-slate-50 p-6">
            <Layers2 size={48} color={colors.accent} strokeWidth={1} />
          </View>
          <Text className="mb-2 text-center text-lg font-semibold text-slate-900">
            {t("links.dashboard.empty_read_soon.title")}
          </Text>
          <Text className="mb-8 text-center text-sm leading-5 text-slate-600">
            {t("links.dashboard.empty_read_soon.description")}
          </Text>

          <Pressable
            onPress={() => router.push("/swipes")}
            className="flex-row items-center gap-2 rounded-full bg-mainDark px-6 py-3 shadow-sm active:bg-mainHover"
          >
            <Text className="font-semibold text-white">
              {t("links.dashboard.empty_read_soon.go_to_triage")}
            </Text>
            <ArrowRight size={20} color={colors.accent} strokeWidth={1.5} />
          </Pressable>
        </View>
      );
    }

    // Latestタブの場合は既存の空状態を表示
    return <LinkListEmpty />;
  }

  // タブタイプに基づいて遷移先URLを決定
  const viewAllHref =
    tabType === "read_soon"
      ? "/links?status=read_soon"
      : tabType === "latest"
        ? "/links?status=new"
        : "/links";

  return (
    <View>
      {links.map((item) => (
        <View className="py-1" key={item.link_id}>
          <LinkListCard link={item} />
        </View>
      ))}
      <View className="flex-row items-center justify-center py-4">
        <Link
          href={viewAllHref}
          className="rounded-full border border-slate-200 px-4 py-2"
        >
          <View className="flex-row items-center justify-center gap-2 ">
            <Text className="text-center text-sm text-slate-500">
              {t("links.dashboard.view_all")}
            </Text>
            <ArrowRight size={14} color={colors.icon} strokeWidth={1.5} />
          </View>
        </Link>
      </View>
    </View>
  );
});
