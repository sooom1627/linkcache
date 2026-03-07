import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTranslation } from "react-i18next";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { colors } from "@/src/shared/constants/colors";

import type { TabType } from "../types/linkList.types";

const TABS: readonly TabType[] = [
  "read_soon",
  "latest",
  "stock",
  "done",
] as const;

const FADE_DURATION = 150;

interface LinkListTabHeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

/**
 * タブヘッダーコンポーネント
 * ピル型のコンテナ内にタブを配置。アクティブタブのみ白背景＋フェードアニメーション。
 */
export function LinkListTabHeader({
  activeTab,
  onTabChange,
}: LinkListTabHeaderProps) {
  const { t } = useTranslation();

  return (
    <View
      className="mb-2 flex-row overflow-hidden rounded-full p-1"
      style={{ backgroundColor: colors.surfaceMuted }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <Pressable
            key={tab}
            onPress={() => onTabChange(tab)}
            style={{ flexBasis: 0, flexGrow: 1, flexShrink: 1 }}
            className="relative items-center justify-center rounded-full py-2"
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={t(`links.dashboard.tabs.${tab}`)}
          >
            {isActive && (
              <Animated.View
                pointerEvents="none"
                entering={FadeIn.duration(FADE_DURATION)}
                exiting={FadeOut.duration(FADE_DURATION)}
                style={{
                  ...StyleSheet.absoluteFillObject,
                  backgroundColor: colors.surface,
                  borderRadius: 9999,
                }}
              />
            )}
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              className={`relative z-10 text-center text-sm ${
                isActive
                  ? "font-semibold text-mainDark"
                  : "font-normal text-textMuted"
              }`}
            >
              {t(`links.dashboard.tabs.${tab}`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
