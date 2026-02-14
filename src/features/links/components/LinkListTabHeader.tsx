import { useTranslation } from "react-i18next";

import { Pressable, Text, View } from "@/src/tw";

import type { TabType } from "../types/linkList.types";

interface LinkListTabHeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

/**
 * タブヘッダーコンポーネント
 */
export function LinkListTabHeader({
  activeTab,
  onTabChange,
}: LinkListTabHeaderProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row gap-8 border-b border-slate-100 pb-0.5">
      <Pressable
        onPress={() => onTabChange("read_soon")}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === "read_soon" }}
        accessibilityLabel={t("links.dashboard.tabs.read_soon")}
        className={`border-b-2 pb-2 ${
          activeTab === "read_soon" ? "border-main" : "border-transparent"
        }`}
      >
        <Text
          className={`text-base font-bold ${
            activeTab === "read_soon" ? "text-main" : "text-slate-400"
          }`}
        >
          {t("links.dashboard.tabs.read_soon")}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onTabChange("latest")}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === "latest" }}
        accessibilityLabel={t("links.dashboard.tabs.latest")}
        className={`border-b-2 pb-2 ${
          activeTab === "latest" ? "border-main" : "border-transparent"
        }`}
      >
        <Text
          className={`text-base font-bold ${
            activeTab === "latest" ? "text-main" : "text-slate-400"
          }`}
        >
          {t("links.dashboard.tabs.latest")}
        </Text>
      </Pressable>
    </View>
  );
}
