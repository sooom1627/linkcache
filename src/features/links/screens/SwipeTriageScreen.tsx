import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useSwipeTriage } from "../hooks/useSwipeTriage";

/**
 * Swipe Triage画面コンポーネント
 *
 * Step 2実装中: シンプルなドラッグ機能のみ
 * コールバックやアニメーションは後で追加
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

  const { width: screenWidth } = useWindowDimensions();
  const SWIPE_THRESHOLD = screenWidth * 0.3; // 画面幅の30%

  // シンプルなドラッグ用のshared values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Pan gesture with threshold detection
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      const swipedRight = e.translationX > SWIPE_THRESHOLD;
      const swipedLeft = e.translationX < -SWIPE_THRESHOLD;

      if (swipedRight) {
        // 右にスワイプ → 画面外へ飛ばしてからコールバック
        translateX.value = withTiming(
          screenWidth,
          { duration: 200 },
          (finished) => {
            if (finished && currentLink) {
              runOnJS(handleSwipeRight)(currentLink.link_id);
            }
          },
        );
      } else if (swipedLeft) {
        // 左にスワイプ → 画面外へ飛ばしてからコールバック
        translateX.value = withTiming(
          -screenWidth,
          { duration: 200 },
          (finished) => {
            if (finished && currentLink) {
              runOnJS(handleSwipeLeft)(currentLink.link_id);
            }
          },
        );
      } else {
        // 閾値未満 → 中央に戻る
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  // アニメーションスタイル
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

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
      {/* Swipeable Card */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <Text className="text-xl font-bold text-gray-900" numberOfLines={2}>
            {currentLink.title || "No title"}
          </Text>
          <Text className="mt-2 text-sm text-gray-500" numberOfLines={1}>
            {currentLink.url}
          </Text>
        </Animated.View>
      </GestureDetector>

      {/* Action Buttons（デバッグ用に残す） */}
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

const styles = StyleSheet.create({
  card: {
    width: "100%",
    padding: 24,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
