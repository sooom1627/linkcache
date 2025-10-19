import type { ReactNode } from "react";

import { View } from "react-native";

import Animated from "react-native-reanimated";

import CustomSafeArea from "./CustomSafeArea";
import Header from "./Header";

const HEADER_HEIGHT = 64;

interface ScreenContainerProps {
  children: ReactNode;
  scrollable?: boolean;
  centerContent?: boolean;
  noPaddingBottom?: boolean;
  headerTitle?: string;
}

export function ScreenContainer({
  children,
  headerTitle = "Hello, User",
  scrollable = true,
  centerContent = true,
  noPaddingBottom = false,
}: ScreenContainerProps) {
  const paddingBottom = noPaddingBottom ? "" : "pb-28";
  const contentClassName = centerContent
    ? `flex-1 flex-col items-center gap-4 ${paddingBottom} pt-4 px-4`.trim()
    : `flex-1 flex-col gap-4 ${paddingBottom} pt-4 px-4`.trim();

  if (scrollable) {
    return (
      <CustomSafeArea>
        <Header title={headerTitle} />
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
      </CustomSafeArea>
    );
  }

  return (
    <CustomSafeArea>
      <Header title={headerTitle} />
      <View className="flex-1" style={{ paddingTop: HEADER_HEIGHT }}>
        <View className={contentClassName}>{children}</View>
      </View>
    </CustomSafeArea>
  );
}
