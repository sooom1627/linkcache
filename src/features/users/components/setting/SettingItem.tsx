import type { ReactNode } from "react";

import { Text, TouchableOpacity, View } from "react-native";

import { ChevronRight } from "lucide-react-native";

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
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint="Open setting item"
      hitSlop={8}
      activeOpacity={0.8}
      className="w-full flex-row items-start justify-between gap-4 p-2"
    >
      {children}
      <View className="flex-1 flex-row items-center justify-between gap-4">
        <Text className="font-bold text-slate-700">{title}</Text>
        <View pointerEvents="none">
          <ChevronRight size={20} color="#6B7280" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
