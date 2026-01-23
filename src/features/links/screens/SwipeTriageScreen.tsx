import { useEffect, useState } from "react";

import { Pressable, Text, View } from "react-native";

import { ChevronDown } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { cardStack, isLoading, error, handleSwipeLeft, handleSwipeRight } =
    useSwipeTriage({ sourceType });

  // 回転アニメーション用のSharedValue
  const rotation = useSharedValue(0);

  // isDropdownOpenの変更に応じて回転角度をアニメーション
  useEffect(() => {
    rotation.value = withTiming(isDropdownOpen ? 180 : 0, { duration: 200 });
  }, [isDropdownOpen, rotation]);

  // アニメーションスタイル
  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const handleSelectSourceType = (type: "inbox" | "later") => {
    setSourceType(type);
    setIsDropdownOpen(false);
  };

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
      <View className="flex-1 items-center justify-center px-2 py-24">
        {/* Source Type Selector (Empty Stateでも表示) */}
        <View className="z-20 w-full items-center">
          <View className="relative">
            <Pressable
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              accessibilityRole="button"
              accessibilityLabel={`Current mode: ${t(`links.card.action_modal.status.${sourceType}`)}. Tap to change mode`}
              className="flex-row items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 active:bg-slate-50"
            >
              <Text className="text-sm font-medium text-slate-500">Mode:</Text>
              <Text className="text-sm font-bold text-slate-800">
                {t(`links.card.action_modal.status.${sourceType}`)}
              </Text>
              <Animated.View style={chevronAnimatedStyle}>
                <ChevronDown size={16} color="#64748B" />
              </Animated.View>
            </Pressable>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <View className="absolute top-full z-30 mt-2 w-48 rounded-xl border border-slate-100 bg-white shadow-xl">
                <Pressable
                  onPress={() => handleSelectSourceType("inbox")}
                  accessibilityRole="button"
                  accessibilityState={{ selected: sourceType === "inbox" }}
                  accessibilityLabel={t("links.card.action_modal.status.inbox")}
                  className={`rounded-t-xl px-4 py-3 ${
                    sourceType === "inbox"
                      ? "bg-slate-50"
                      : "active:bg-slate-50"
                  }`}
                >
                  <Text
                    className={`text-center text-sm font-medium ${
                      sourceType === "inbox"
                        ? "text-slate-900"
                        : "text-slate-600"
                    }`}
                  >
                    {t("links.card.action_modal.status.inbox")}
                  </Text>
                </Pressable>

                <View className="h-px w-full bg-slate-100" />

                <Pressable
                  onPress={() => handleSelectSourceType("later")}
                  accessibilityRole="button"
                  accessibilityState={{ selected: sourceType === "later" }}
                  accessibilityLabel={t("links.card.action_modal.status.later")}
                  className={`rounded-b-xl px-4 py-3 ${
                    sourceType === "later"
                      ? "bg-slate-50"
                      : "active:bg-slate-50"
                  }`}
                >
                  <Text
                    className={`text-center text-sm font-medium ${
                      sourceType === "later"
                        ? "text-slate-900"
                        : "text-slate-600"
                    }`}
                  >
                    {t("links.card.action_modal.status.later")}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        <View className="flex-1 items-center justify-center">
          <Text className="text-2xl font-bold text-gray-800">
            🎉 No pending links!
          </Text>
          <Text className="mt-2 text-gray-600">All caught up!</Text>
        </View>
      </View>
    );
  }

  // Main Content
  return (
    <View className="flex-1 items-center justify-start px-2 py-24">
      {/* Source Type Selector */}
      <View className="z-20 w-full items-center">
        <View className="relative">
          {/* Dropdown Trigger */}
          <Pressable
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            accessibilityRole="button"
            accessibilityLabel={`Current mode: ${t(`links.card.action_modal.status.${sourceType}`)}. Tap to change mode`}
            className="flex-row items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 active:bg-slate-50"
          >
            <Text className="text-sm font-medium text-slate-500">Mode:</Text>
            <Text className="text-sm font-bold text-slate-800">
              {t(`links.card.action_modal.status.${sourceType}`)}
            </Text>
            <Animated.View style={chevronAnimatedStyle}>
              <ChevronDown size={16} color="#64748B" />
            </Animated.View>
          </Pressable>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <View className="absolute top-full z-30 mt-2 w-48 rounded-xl border border-slate-100 bg-white shadow-xl">
              <Pressable
                onPress={() => handleSelectSourceType("inbox")}
                accessibilityRole="button"
                accessibilityState={{ selected: sourceType === "inbox" }}
                accessibilityLabel={t("links.card.action_modal.status.inbox")}
                className={`rounded-t-xl px-4 py-3 ${
                  sourceType === "inbox" ? "bg-slate-50" : "active:bg-slate-50"
                }`}
              >
                <Text
                  className={`text-center text-sm font-medium ${
                    sourceType === "inbox" ? "text-slate-900" : "text-slate-600"
                  }`}
                >
                  {t("links.card.action_modal.status.inbox")}
                </Text>
              </Pressable>

              <View className="h-px w-full bg-slate-100" />

              <Pressable
                onPress={() => handleSelectSourceType("later")}
                accessibilityRole="button"
                accessibilityState={{ selected: sourceType === "later" }}
                accessibilityLabel={t("links.card.action_modal.status.later")}
                className={`rounded-b-xl px-4 py-3 ${
                  sourceType === "later" ? "bg-slate-50" : "active:bg-slate-50"
                }`}
              >
                <Text
                  className={`text-center text-sm font-medium ${
                    sourceType === "later" ? "text-slate-900" : "text-slate-600"
                  }`}
                >
                  {t("links.card.action_modal.status.later")}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* Card Stack */}
      <View className="w-full flex-1 items-center justify-center">
        <SwipeCardStack
          cards={cardStack}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />
      </View>
    </View>
  );
}
