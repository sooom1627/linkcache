import type { ReactNode } from "react";

import { ScrollView, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import CustomSafeArea from "./CustomSafeArea";
import Header from "./Header";

interface ScreenContainerProps {
  children: ReactNode;
  scrollable?: boolean;
  centerContent?: boolean;
  noPaddingBottom?: boolean;
}

export function ScreenContainer({
  children,
  scrollable = true,
  centerContent = true,
  noPaddingBottom = false,
}: ScreenContainerProps) {
  const paddingBottom = noPaddingBottom ? "" : "pb-28";
  const contentClassName = centerContent
    ? `flex-1 flex-col items-center gap-4 ${paddingBottom} pt-4 px-4`.trim()
    : `flex-1 flex-col gap-4 ${paddingBottom} pt-4 px-4`.trim();

  const insets = useSafeAreaInsets();

  if (scrollable) {
    return (
      <CustomSafeArea>
        <ScrollView
          className="flex-1"
          style={{ paddingTop: insets.top }}
          contentContainerClassName="grow"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Header />
          <View className={contentClassName}>{children}</View>
        </ScrollView>
      </CustomSafeArea>
    );
  }

  return (
    <CustomSafeArea>
      <View className="flex-1" style={{ paddingTop: insets.top }}>
        <Header />
        <View className={contentClassName}>{children}</View>
      </View>
    </CustomSafeArea>
  );
}
