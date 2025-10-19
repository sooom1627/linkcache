import { Pressable, Text, View } from "react-native";

import { ChevronRight } from "lucide-react-native";

interface SettingItemProps {
  children: React.ReactNode;
  title: string;
  onPress: () => void;
}

export default function SettingItem({
  children,
  title,
  onPress,
}: SettingItemProps) {
  return (
    <View className="w-full flex-row items-start justify-between gap-4 p-2">
      {children}
      <View className="flex-1 flex-row items-center justify-between gap-4">
        <Text className="font-bold text-slate-700">{title}</Text>
        <Pressable onPress={onPress}>
          <ChevronRight size={20} color="#6B7280" />
        </Pressable>
      </View>
    </View>
  );
}
