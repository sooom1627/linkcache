import type { ReactNode } from "react";

import { ScrollView, View } from "react-native";

interface ScreenContainerProps {
  children: ReactNode;
  scrollable?: boolean;
}

export function ScreenContainer({
  children,
  scrollable = true,
}: ScreenContainerProps) {
  if (scrollable) {
    return (
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View className="flex-1 flex-col items-center gap-4 pb-12 pt-4">
          {children}
        </View>
      </ScrollView>
    );
  }

  return (
    <View className="flex-1 px-4">
      <View className="flex-1 flex-col items-center gap-4 pb-12 pt-4">
        {children}
      </View>
    </View>
  );
}
