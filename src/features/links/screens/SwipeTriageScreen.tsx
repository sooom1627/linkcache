import { Pressable, Text, View } from "react-native";

import { useSwipeTriage } from "../hooks/useSwipeTriage";

/**
 * Swipe Triage画面コンポーネント
 *
 * Inbox状態のリンクを1件表示し、ボタンでステータスを更新します。
 * - Read Soon (→): read_soonに更新
 * - Later (←): laterに更新
 */
export function SwipeTriageScreen() {
  const {
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
  if (!currentLink) {
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
      {/* Card */}
      <View className="w-full rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
        <Text className="text-xl font-bold text-gray-900" numberOfLines={2}>
          {currentLink.title || "No title"}
        </Text>
        <Text className="mt-2 text-sm text-gray-500" numberOfLines={1}>
          {currentLink.url}
        </Text>
      </View>

      {/* Action Buttons */}
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
          <Text className="text-lg font-semibold text-white">Read Soon →</Text>
        </Pressable>
      </View>
    </View>
  );
}
