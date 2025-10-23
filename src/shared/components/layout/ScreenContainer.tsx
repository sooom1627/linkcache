import type { ReactNode } from "react";

import { View } from "react-native";

import Animated from "react-native-reanimated";

const HEADER_HEIGHT = 64;

interface ScreenContainerProps {
  children: ReactNode;
  scrollable?: boolean;
  centerContent?: boolean;
  noPaddingBottom?: boolean;
  headerTitle?: string;
  topComponent?: boolean;
}

export function ScreenContainer({
  children,
  scrollable = true,
  centerContent = true,
  noPaddingBottom = false,
}: ScreenContainerProps) {
  const paddingBottom = noPaddingBottom ? "" : "pb-28";
  const contentClassName = centerContent
    ? `flex-1 flex-col items-center gap-4 ${paddingBottom} pt-2 px-4`.trim()
    : `flex-1 flex-col gap-4 ${paddingBottom} pt-2 px-4`.trim();

  if (scrollable) {
    return (
      <View className="flex-1">
        <Animated.ScrollView
          className="flex-1"
          style={{ paddingTop: HEADER_HEIGHT }}
          contentContainerClassName="grow"
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View className={contentClassName}>{children}</View>
        </Animated.ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="flex-1">
        <View className={contentClassName}>{children}</View>
      </View>
    </View>
  );
}
