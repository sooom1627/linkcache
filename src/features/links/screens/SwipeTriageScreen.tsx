import { useState } from "react";

import { Pressable, Text, View } from "react-native";

import { useTranslation } from "react-i18next";

import { SwipeCardStack } from "../components/SwipeCardStack";
import { useSwipeTriage } from "../hooks/useSwipeTriage";

/**
 * Swipe Triage画面コンポーネント
 *
 * Step 4: カードスタックとOGP画像表示
 */
export function SwipeTriageScreen() {
  const { t } = useTranslation();
  const [sourceType, setSourceType] = useState<"inbox" | "later">("inbox");

  const { cardStack, isLoading, error, handleSwipeLeft, handleSwipeRight } =
    useSwipeTriage({ sourceType });

  // Loading State
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-600">Loading...</Text>
      </View>
    );
  }

  // Error State
  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-600">Error: {error.message}</Text>
      </View>
    );
  }

  // Empty State (Inbox Zero)
  if (cardStack.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-gray-800">🎉 Inbox Zero!</Text>
        <Text className="mt-2 text-gray-600">All caught up!</Text>
      </View>
    );
  }

  // Main Content
  return (
    <View className="flex-1 items-center justify-center px-2">
      {/* Card Stack */}
      <SwipeCardStack
        cards={cardStack}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
      />

      {/* Source Type Selector */}
      <View className="mb-4 flex-row gap-2">
        <Pressable
          onPress={() => setSourceType("inbox")}
          accessibilityRole="button"
          accessibilityState={{ selected: sourceType === "inbox" }}
          accessibilityLabel={t("links.card.action_modal.status.inbox")}
          className={`rounded-full px-4 py-2 ${
            sourceType === "inbox"
              ? "bg-slate-900 active:bg-slate-800"
              : "bg-slate-100 active:bg-slate-200"
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              sourceType === "inbox" ? "text-white" : "text-slate-600"
            }`}
          >
            {t("links.card.action_modal.status.inbox")}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setSourceType("later")}
          accessibilityRole="button"
          accessibilityState={{ selected: sourceType === "later" }}
          accessibilityLabel={t("links.card.action_modal.status.later")}
          className={`rounded-full px-4 py-2 ${
            sourceType === "later"
              ? "bg-slate-900 active:bg-slate-800"
              : "bg-slate-100 active:bg-slate-200"
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              sourceType === "later" ? "text-white" : "text-slate-600"
            }`}
          >
            {t("links.card.action_modal.status.later")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
