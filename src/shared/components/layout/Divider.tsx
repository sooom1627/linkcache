import { Text, View } from "react-native";

interface DividerProps {
  text?: string;
}

export function Divider({ text }: DividerProps) {
  return (
    <View className="my-2 flex w-full flex-row items-center gap-2">
      <View className="h-px w-full flex-1 bg-slate-300" />
      <Text className="text-slate-700">{text}</Text>
      <View className="h-px w-full flex-1 bg-slate-300" />
    </View>
  );
}
