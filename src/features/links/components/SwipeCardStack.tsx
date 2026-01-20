import { useEffect } from "react";

import { StyleSheet, useWindowDimensions, View } from "react-native";

import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
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
  }));

  if (!topCard) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Queued Card (3rd) - 一番後ろ */}
      {queuedCard && (
        <Animated.View
          key={queuedCard.link_id}
          style={[styles.cardWrapper, styles.queuedCard]}
        >
          <SwipeCard link={queuedCard} index={2} />
        </Animated.View>
      )}

      {/* Next Card (2nd) - 中間 */}
      {nextCard && (
        <Animated.View
          key={nextCard.link_id}
          style={[styles.cardWrapper, styles.nextCard]}
        >
          <SwipeCard link={nextCard} index={1} />
        </Animated.View>
      )}

      {/* Top Card (1st) - 一番手前、スワイプ可能 */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          key={topCard.link_id}
          style={[styles.cardWrapper, styles.topCard, topCardStyle]}
        >
          <SwipeCard link={topCard} index={0} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 450,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  cardWrapper: {
    position: "absolute",
    width: "90%",
    maxWidth: 400,
    height: "100%",
  },
  topCard: {
    zIndex: 3,
  },
  nextCard: {
    zIndex: 2,
    transform: [{ scale: 0.95 }, { translateY: 8 }],
    opacity: 0.7,
  },
  queuedCard: {
    zIndex: 1,
    transform: [{ scale: 0.9 }, { translateY: 16 }],
    opacity: 0.4,
  },
});
