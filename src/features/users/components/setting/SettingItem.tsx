import type { ReactNode } from "react";

import { ChevronRight } from "lucide-react-native";

import { colors } from "@/src/shared/constants/colors";
import { Pressable, Text, View } from "@/src/tw";

interface SettingItemProps {
  children: ReactNode;
  title: string;
  onPress: () => void;
}

export default function SettingItem({
  children,
  title,
  onPress,
}: SettingItemProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint="Open setting item"
      hitSlop={8}
      className="active:bg-surface-muted w-full flex-row items-start justify-between gap-4 p-2"
    >
      {children}
      <View className="flex-1 flex-row items-center justify-between gap-4">
        <Text className="font-bold text-slate-700">{title}</Text>
        <View pointerEvents="none">
          <ChevronRight size={20} color={colors.icon} />
        </View>
      </View>
    </Pressable>
  );
}
