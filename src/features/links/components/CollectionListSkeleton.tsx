import type { ReactElement } from "react";
import { useEffect } from "react";

import { View } from "react-native";

import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/src/shared/constants/colors";

const DEFAULT_COUNT = 3;
const ICON_SIZE = 32;

interface CollectionListSkeletonProps {
  /** スケルトンアイテムの表示件数 */
  count?: number;
}

/**
 * コレクションリストのスケルトン
 *
 * CollectionListItem の形状に合わせたプレースホルダーを複数並べ、
 * パルスアニメーションで読み込み中状態を可視化する。
 */
export function CollectionListSkeleton({
  count = DEFAULT_COUNT,
}: CollectionListSkeletonProps): ReactElement {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
    return () => {
      cancelAnimation(opacity);
    };
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View testID="collection-list-skeleton" className="gap-1">
      {Array.from({ length: count }).map((_, index) => (
        <Animated.View
          key={index}
          testID="collection-list-skeleton-item"
          style={animatedStyle}
          className="flex-row items-center gap-3 rounded-lg border border-slate-100 bg-white p-2.5"
        >
          {/* アイコンプレースホルダー */}
          <View
            className="rounded-lg"
            style={{
              width: ICON_SIZE,
              height: ICON_SIZE,
              backgroundColor: colors.surfaceMutedActive,
            }}
          />
          {/* タイトルプレースホルダー */}
          <View
            className="flex-1 rounded"
            style={{
              height: 16,
              maxWidth: "60%",
              backgroundColor: colors.surfaceMutedActive,
            }}
          />
          {/* カウントプレースホルダー */}
          <View
            className="rounded"
            style={{
              width: 48,
              height: 12,
              backgroundColor: colors.surfaceMutedActive,
            }}
          />
        </Animated.View>
      ))}
    </View>
  );
}
