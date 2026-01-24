import { useEffect } from "react";

import { Text, useWindowDimensions, View } from "react-native";

import { CalendarArrowUp, Clock } from "lucide-react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import type { UserLink } from "../types/linkList.types";

import { SwipeCard } from "./SwipeCard";

interface SwipeCardStackProps {
  cards: UserLink[];
  onSwipeLeft: (linkId: string) => void;
  onSwipeRight: (linkId: string) => void;
}

/**
 * カードスタックコンポーネント
 *
 * 3枚のカード（Top, Next, Queued）をスタック表示し、
 * トップカードのみスワイプ可能にします。
 */
export function SwipeCardStack({
  cards,
  onSwipeLeft,
  onSwipeRight,
}: SwipeCardStackProps) {
  const { width: screenWidth } = useWindowDimensions();
  const SWIPE_THRESHOLD = screenWidth * 0.3;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const topCard = cards[0];
  const nextCard = cards[1];
  const queuedCard = cards[2];

  // Reset animation values when top card changes
  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
  }, [topCard?.link_id, translateX, translateY]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      const swipedRight = e.translationX > SWIPE_THRESHOLD;
      const swipedLeft = e.translationX < -SWIPE_THRESHOLD;

      if (swipedRight && topCard) {
        translateX.value = withTiming(
          screenWidth,
          { duration: 200 },
          (finished) => {
            if (finished) {
              runOnJS(onSwipeRight)(topCard.link_id);
            }
          },
        );
      } else if (swipedLeft && topCard) {
        translateX.value = withTiming(
          -screenWidth,
          { duration: 200 },
          (finished) => {
            if (finished) {
              runOnJS(onSwipeLeft)(topCard.link_id);
            }
          },
        );
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const topCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${(translateX.value / screenWidth) * 15}deg` },
    ],
    opacity: Math.max(0, 1 - Math.abs(translateX.value) / (screenWidth * 1.2)),
    zIndex: 3,
  }));

  const nextCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.95 }, { translateY: 16 }],
    opacity: 0.7,
    zIndex: 2,
  }));

  const queuedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.9 }, { translateY: 32 }],
    opacity: 0.4,
    zIndex: 1,
  }));

  // 右スワイプ時のフィードバック（Read soon）
  const rightFeedbackStyle = useAnimatedStyle(() => {
    "worklet";
    return {
      opacity: interpolate(
        translateX.value,
        [0, SWIPE_THRESHOLD],
        [0, 1],
        "clamp",
      ),
    };
  });

  // 左スワイプ時のフィードバック（Later）
  const leftFeedbackStyle = useAnimatedStyle(() => {
    "worklet";
    return {
      opacity: interpolate(
        translateX.value,
        [0, -SWIPE_THRESHOLD],
        [0, 1],
        "clamp",
      ),
    };
  });

  if (!topCard) {
    return null;
  }

  return (
    <View className="relative h-[240px] w-full items-center justify-center">
      {/* Queued Card (3rd) - 一番後ろ */}
      {queuedCard && (
        <Animated.View
          key={queuedCard.link_id}
          className="absolute h-full w-[99%] max-w-[500px] items-center justify-center"
          style={queuedCardStyle}
        >
          <SwipeCard link={queuedCard} index={2} />
        </Animated.View>
      )}

      {/* Next Card (2nd) - 中間 */}
      {nextCard && (
        <Animated.View
          key={nextCard.link_id}
          className="absolute h-full w-[99%] max-w-[500px] items-center justify-center"
          style={nextCardStyle}
        >
          <SwipeCard link={nextCard} index={1} />
        </Animated.View>
      )}

      {/* Top Card (1st) - 一番手前、スワイプ可能 */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          key={topCard.link_id}
          className="absolute h-full w-[99%] max-w-[500px] items-center justify-center"
          style={topCardStyle}
        >
          <SwipeCard link={topCard} index={0} />
        </Animated.View>
      </GestureDetector>

      {/* スワイプフィードバック（カードの上に独立して配置） */}
      <View
        className="pointer-events-none absolute h-full w-[99%] max-w-[500px]"
        style={{ zIndex: 10 }}
      >
        {/* 右スワイプ: Read soon */}
        <Animated.View
          className="absolute left-4 top-4 flex-row items-center gap-2 rounded-lg border-2 border-blue-600 bg-blue-600 px-3 py-2"
          style={rightFeedbackStyle}
        >
          <CalendarArrowUp size={20} color="#FFFFFF" />
          <Text className="text-base font-bold text-white">Read soon</Text>
        </Animated.View>

        {/* 左スワイプ: Later */}
        <Animated.View
          className="absolute right-4 top-4 flex-row items-center gap-2 rounded-lg border-2 border-gray-500 bg-gray-500 px-3 py-2"
          style={leftFeedbackStyle}
        >
          <Clock size={20} color="#FFFFFF" />
          <Text className="text-base font-bold text-white">Later</Text>
        </Animated.View>
      </View>
    </View>
  );
}
