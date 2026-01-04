import { Pressable, Text, View } from "react-native";

import { useTranslation } from "react-i18next";

type TabType = "keep" | "latest";

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
        onPress={() => onTabChange("keep")}
        className={`border-b-2 pb-2 ${
          activeTab === "keep" ? "border-slate-900" : "border-transparent"
        }`}
      >
        <Text
          className={`text-base font-bold ${
            activeTab === "keep" ? "text-slate-900" : "text-slate-400"
          }`}
        >
          {t("links.dashboard.tabs.keep")}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onTabChange("latest")}
        className={`border-b-2 pb-2 ${
          activeTab === "latest" ? "border-slate-900" : "border-transparent"
        }`}
      >
        <Text
          className={`text-base font-bold ${
            activeTab === "latest" ? "text-slate-900" : "text-slate-400"
          }`}
        >
          {t("links.dashboard.tabs.latest")}
        </Text>
      </Pressable>
    </View>
  );
}
