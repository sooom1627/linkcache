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
      <View className="mb-4 flex-row gap-4 border-b border-border rounded-lg">
        <Pressable
          onPress={() => onTabChange("read_soon")}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "read_soon" }}
          accessibilityLabel={t("links.dashboard.tabs.read_soon")}
          className={`pb-3 ${
            activeTab === "read_soon" ? "border-b-2 border-main" : ""
          }`}
        >
          <Text
            className={`text-sm font-semibold uppercase tracking-wider ${
              activeTab === "read_soon" ? "text-mainDark" : "text-textMuted"
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
          className={`pb-3 ${
            activeTab === "latest" ? "border-b-2 border-main" : ""
          }`}
        >
          <Text
            className={`text-sm font-semibold uppercase tracking-wider ${
              activeTab === "latest" ? "text-mainDark" : "text-textMuted"
            }`}
          >
            {t("links.dashboard.tabs.latest")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
