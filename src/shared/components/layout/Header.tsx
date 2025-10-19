import { Text, TouchableOpacity, View } from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { ArrowLeft, UserRound } from "lucide-react-native";

export interface HeaderProps {
  title: string;
  topComponent?: boolean;
  topInset?: number;
}

export default function Header({
  title = "Hello, User",
  topComponent = true,
  topInset = 0,
}: HeaderProps) {
  const HEADER_HEIGHT = 64;

  return (
    <View
      className="absolute inset-x-0 top-0 z-10 h-16"
      style={{ paddingTop: topInset }}
    >
      <LinearGradient
        colors={[
          "rgba(255, 255, 255, 1)",
          "rgba(255, 255, 255, 0.9)",
          "rgba(255, 255, 255, 0.0)",
        ]}
        locations={[0, 0.6, 1]}
        style={{ height: HEADER_HEIGHT }}
      >
        {topComponent ? (
          <View className="flex-row items-center justify-start gap-4 px-4 py-2">
            <View className="rounded-full bg-zinc-200 p-4">
              <UserRound size={16} color="black" />
            </View>
            <Text className="text-2xl font-bold text-zinc-700">{title}</Text>
          </View>
        ) : (
          <View className="flex-row items-center justify-start gap-4 px-4 py-2">
            <TouchableOpacity
              onPress={() => router.back()}
              className="rounded-full bg-zinc-200 p-4"
            >
              <ArrowLeft size={16} color="black" />
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}
