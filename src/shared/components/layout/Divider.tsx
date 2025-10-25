import { Text, View } from "react-native";

export function Divider({ text = "" }: { text: string }) {
  return (
    <View className="my-2 flex w-full flex-row items-center gap-2">
      <View className="h-px w-full flex-1 bg-slate-300" />
      <Text className="text-slate-700">{text}</Text>
      <View className="h-px w-full flex-1 bg-slate-300" />
    </View>
  );
}
