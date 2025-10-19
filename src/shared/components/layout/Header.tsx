import { Text, View } from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { UserRound } from "lucide-react-native";

export interface HeaderProps {
  title: string;
  insetTop: number;
}

export default function Header({
  title = "Hello, User",
  insetTop,
}: HeaderProps) {
  return (
    <View
      className="absolute inset-x-0 top-0 z-10 h-16"
      style={{ marginTop: insetTop }}
    >
      <LinearGradient
        colors={[
          "rgba(255, 255, 255, 0.9)",
          "rgba(255, 255, 255, 0.9)",
          "rgba(255, 255, 255, 0.0)",
        ]}
        locations={[0, 0.6, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ height: insetTop }}
      >
        <View className="flex-row items-center justify-start gap-4 px-4 py-2">
          <View className="rounded-full bg-zinc-200 p-4">
            <UserRound size={16} color="black" />
          </View>
          <Text className="text-2xl font-bold text-zinc-700">{title}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}
