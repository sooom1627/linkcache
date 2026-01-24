import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

import { useWindowDimensions, View } from "react-native";

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

export interface SwipeCardStackRef {
  swipeLeft: () => void;
  swipeRight: () => void;
}

interface SwipeCardStackProps {
  cards: UserLink[];
  onSwipeLeft: (linkId: string) => void;
  onSwipeRight: (linkId: string) => void;
}

// アニメーション中のカードを追跡（連続スワイプ防止＆UIの整合性維持）
interface AnimatingCard {
  linkId: string;
  direction: "left" | "right";
}

/**
 * カードスタックコンポーネント
 *
 * 3枚のカード（Top, Next, Queued）をスタック表示し、
 * トップカードのみスワイプ可能にします。
 */
export const SwipeCardStack = forwardRef<
  SwipeCardStackRef,
  SwipeCardStackProps
>(function SwipeCardStack({ cards, onSwipeLeft, onSwipeRight }, ref) {
  const { width: screenWidth } = useWindowDimensions();
  const SWIPE_THRESHOLD = screenWidth * 0.3;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // アニメーション中のカードを追跡（連続スワイプ防止）
  const animatingCardRef = useRef<AnimatingCard | null>(null);

  // アニメーション中のカードを除外した表示用カード
  const displayCards = animatingCardRef.current
    ? cards.filter((card) => card.link_id !== animatingCardRef.current?.linkId)
    : cards;

  const topCard = displayCards[0];
  const nextCard = displayCards[1];
  const queuedCard = displayCards[2];

  // Reset animation values when top card changes
  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
  }, [topCard?.link_id, translateX, translateY]);

  // アニメーション完了時の処理
  const handleAnimationComplete = () => {
    animatingCardRef.current = null;
  };

  // スワイプ実行（optimistic update: callback即座実行）
  const executeSwipe = (
    linkId: string,
    direction: "left" | "right",
    callback: (linkId: string) => void,
  ) => {
    // 既にアニメーション中なら無視
    if (animatingCardRef.current) return;

    // アニメーション中としてマーク
    animatingCardRef.current = { linkId, direction };

    // 即座にcallbackを呼んでoptimistic update
    callback(linkId);

    // アニメーション開始
    const targetX = direction === "left" ? -screenWidth : screenWidth;
    translateX.value = withTiming(targetX, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(handleAnimationComplete)();
      }
    });
  };

  // Expose swipe methods via ref
  useImperativeHandle(
    ref,
    () => ({
      swipeLeft: () => {
        const card = cards[0];
        if (card) {
          executeSwipe(card.link_id, "left", onSwipeLeft);
        }
      },
      swipeRight: () => {
        const card = cards[0];
        if (card) {
          executeSwipe(card.link_id, "right", onSwipeRight);
        }
      },
    }),
    [cards, onSwipeLeft, onSwipeRight],
  );

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // アニメーション中はジェスチャー無視
      if (animatingCardRef.current) return;
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      // アニメーション中はジェスチャー無視
      if (animatingCardRef.current) return;

      const swipedRight = e.translationX > SWIPE_THRESHOLD;
      const swipedLeft = e.translationX < -SWIPE_THRESHOLD;

      if (swipedRight && topCard) {
        executeSwipe(topCard.link_id, "right", onSwipeRight);
      } else if (swipedLeft && topCard) {
        executeSwipe(topCard.link_id, "left", onSwipeLeft);
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
    </View>
  );
});
