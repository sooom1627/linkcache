import { useEffect } from "react";

import type { StyleProp, ViewStyle } from "react-native";
import { ScrollView, View } from "react-native";

import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/src/shared/constants/colors";

/** OG画像サイズ（LinkListCard と同一） */
const OG_IMAGE_HEIGHT = 72;
const OG_IMAGE_WIDTH = Math.round(OG_IMAGE_HEIGHT * 1.91);

const SKELETON_CARD_COUNT = 6;

interface LinkListSkeletonProps {
  contentContainerStyle?: StyleProp<ViewStyle>;
}

const skeletonBlockStyle = {
  borderRadius: 4,
  backgroundColor: colors.surfaceMutedActive,
} as const;

/**
 * リンクリストのスケルトン
 *
 * LinkListTabContent のローディング時に表示。
 * LinkListCard の形状に合わせたカードを複数並べ、パルスアニメーションで待機状態を可視化する。
 */
export function LinkListSkeleton({
  contentContainerStyle,
}: LinkListSkeletonProps) {
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
    <ScrollView
      className="flex-1"
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
    >
      {Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
        <View key={index} className="py-1">
          <View className="flex-row items-center gap-3 rounded-2xl bg-white/80 p-2">
            <Animated.View
              style={[
                animatedStyle,
                {
                  width: OG_IMAGE_WIDTH,
                  height: OG_IMAGE_HEIGHT,
                  borderRadius: 8,
                  backgroundColor: colors.surfaceMutedActive,
                },
              ]}
            />
            <View className="flex-1 justify-center py-1">
              <Animated.View
                style={[
                  animatedStyle,
                  { ...skeletonBlockStyle, width: "80%", height: 16 },
                ]}
              />
              <Animated.View
                style={[
                  animatedStyle,
                  {
                    ...skeletonBlockStyle,
                    width: "60%",
                    height: 16,
                    marginTop: 6,
                  },
                ]}
              />
              <Animated.View
                style={[
                  animatedStyle,
                  {
                    ...skeletonBlockStyle,
                    width: "40%",
                    height: 12,
                    marginTop: 8,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
