import { View } from "react-native";

import { Text } from "@react-navigation/elements";

export default function Divider({ text = "" }: { text: string }) {
  return (
    <View className="my-2 flex w-full flex-row items-center gap-2">
      <View className="h-px w-full flex-1 bg-zinc-300" />
      <Text className="text-zinc-700">{text}</Text>
      <View className="h-px w-full flex-1 bg-zinc-300" />
    </View>
  );
}
