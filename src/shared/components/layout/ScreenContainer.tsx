import type { ReactNode } from "react";

import { ScrollView, View } from "react-native";

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
    ? `flex-1 flex-col items-center gap-4 ${paddingBottom} pt-4`.trim()
    : `flex-1 flex-col gap-4 ${paddingBottom} pt-4`.trim();

  if (scrollable) {
    return (
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View className={contentClassName}>{children}</View>
      </ScrollView>
    );
  }

  return (
    <View className="flex-1 px-4">
      <View className={contentClassName}>{children}</View>
    </View>
  );
}
