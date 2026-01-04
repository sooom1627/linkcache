import { memo } from "react";

import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useRouter } from "expo-router";

import { ArrowRight, Layers2 } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import type { useLinks } from "../hooks/useLinks";

import { LinkListCard } from "./LinkListCard";
import { LinkListEmpty } from "./LinkListEmpty";

type TabType = "keep" | "latest";

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
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <Text className="text-sm text-slate-500">
          {error?.message || t("links.dashboard.error_load_failed")}
        </Text>
      </View>
    );
  }

  if (links.length === 0) {
    // Keepタブの場合はTriageへ誘導するボタンを表示
    if (tabType === "keep") {
      return (
        <View className="mt-12 items-center px-8">
          <View className="mb-6 rounded-full bg-slate-50 p-6">
            <Layers2 size={48} color="#3b82f6" strokeWidth={1} />
          </View>
          <Text className="mb-2 text-center text-lg font-semibold text-slate-900">
            {t("links.dashboard.empty_keep.title")}
          </Text>
          <Text className="mb-8 text-center text-sm leading-5 text-slate-600">
            {t("links.dashboard.empty_keep.description")}
          </Text>

          <Pressable
            onPress={() => router.push("/swipes")}
            className="flex-row items-center gap-2 rounded-full bg-slate-900 px-6 py-3 shadow-sm active:bg-slate-700"
          >
            <Text className="font-semibold text-white">
              {t("links.dashboard.empty_keep.go_to_triage")}
            </Text>
            <ArrowRight size={20} color="white" strokeWidth={1.5} />
          </Pressable>
        </View>
      );
    }

    // Latestタブの場合は既存の空状態を表示
    return <LinkListEmpty />;
  }

  return (
    <View>
      {links.map((item) => (
        <View className="py-1" key={item.link_id}>
          <LinkListCard link={item} />
        </View>
      ))}
      <View className="flex-row items-center justify-center py-4">
        <Text className="text-sm text-slate-500">
          {t("links.dashboard.view_all")}
        </Text>
        <ArrowRight size={14} color="#6B7280" strokeWidth={1.5} />
      </View>
    </View>
  );
});
