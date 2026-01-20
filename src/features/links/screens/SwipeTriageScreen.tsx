import { Pressable, Text, View } from "react-native";

import { SwipeCardStack } from "../components/SwipeCardStack";
import { useSwipeTriage } from "../hooks/useSwipeTriage";

/**
 * Swipe Triage画面コンポーネント
 *
 * Step 4: カードスタックとOGP画像表示
 */
export function SwipeTriageScreen() {
  const {
    cardStack,
    currentLink,
    isLoading,
    error,
    isUpdating,
    handleSwipeLeft,
    handleSwipeRight,
  } = useSwipeTriage();

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
    <View className="flex-1 items-center justify-center px-4">
      {/* Card Stack */}
      <SwipeCardStack
        cards={cardStack}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
      />

      {/* Action Buttons（デバッグ用） */}
      {currentLink && (
        <View className="mt-8 w-full flex-row justify-around">
          <Pressable
            onPress={() => handleSwipeLeft(currentLink.link_id)}
            disabled={isUpdating}
            className="rounded-lg bg-yellow-500 px-8 py-4 active:bg-yellow-600 disabled:opacity-50"
          >
            <Text className="text-lg font-semibold text-white">← Later</Text>
          </Pressable>

          <Pressable
            onPress={() => handleSwipeRight(currentLink.link_id)}
            disabled={isUpdating}
            className="rounded-lg bg-green-500 px-8 py-4 active:bg-green-600 disabled:opacity-50"
          >
            <Text className="text-lg font-semibold text-white">
              Read Soon →
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
