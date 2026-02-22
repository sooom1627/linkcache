import { useEffect } from "react";

import { View } from "react-native";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const SKELETON_CHIP_COUNT = 4;

/**
 * コレクションセクションのスケルトン
 *
 * CollectionChip の形状に合わせた角丸矩形を複数並べ、
 * パルスアニメーションで待機状態を可視化する。
 * LinkDetailScreen のコレクション一覧読み込み中に表示する。
 */
export function CollectionsSectionSkeleton() {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View
      testID="collections-section-skeleton"
      className="flex-row flex-wrap gap-2"
    >
      {Array.from({ length: SKELETON_CHIP_COUNT }).map((_, index) => (
        <Animated.View
          key={index}
          testID="collections-skeleton-chip"
          style={[
            animatedStyle,
            {
              width: 60 + index * 20,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#e2e8f0",
            },
          ]}
        />
      ))}
    </View>
  );
}
