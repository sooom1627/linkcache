import { Pressable, Text, View } from "react-native";

import { useTranslation } from "react-i18next";

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
    <View>
      <View className="mb-4 flex-row gap-4 rounded-lg border-b border-border">
        <Pressable
          onPress={() => onTabChange("read_soon")}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "read_soon" }}
          accessibilityLabel={t("links.dashboard.tabs.read_soon")}
          className="relative rounded-lg pb-3"
        >
          <Text
            className={`text-sm font-semibold uppercase tracking-wider ${
              activeTab === "read_soon" ? "text-mainDark" : "text-textMuted"
            }`}
          >
            {t("links.dashboard.tabs.read_soon")}
          </Text>
          {activeTab === "read_soon" && (
            <View className="absolute inset-x-0 bottom-[-1.5] h-0.5 rounded-full bg-main" />
          )}
        </Pressable>

        <Pressable
          onPress={() => onTabChange("latest")}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "latest" }}
          accessibilityLabel={t("links.dashboard.tabs.latest")}
          className="relative rounded-lg pb-3"
        >
          <Text
            className={`text-sm font-semibold uppercase tracking-wider ${
              activeTab === "latest" ? "text-mainDark" : "text-textMuted"
            }`}
          >
            {t("links.dashboard.tabs.latest")}
          </Text>
          {activeTab === "latest" && (
            <View className="absolute inset-x-0 bottom-[-1.5] h-0.5 rounded-full bg-main" />
          )}
        </Pressable>
      </View>
    </View>
  );
}
