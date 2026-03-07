import { Text, View } from "react-native";

interface PillBadgeProps {
  emoji?: string;
  count?: number;
}

/** ピル型バッジ（デザインのみ） */
export function PillBadge({ emoji = "🔥", count = 12 }: PillBadgeProps) {
  return (
    <View className="flex-row items-center gap-1.5 rounded-full bg-slate-100 px-3 py-2">
      <Text className="text-base">{emoji}</Text>
      <Text className="text-sm font-medium text-slate-800">{count}</Text>
    </View>
  );
}
