import { Text, TouchableOpacity, View } from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { ArrowLeft, UserRound } from "lucide-react-native";

import { useModal } from "@/src/shared/providers";

export interface HeaderProps {
  title: string;
  topComponent?: boolean;
}
const HEADER_HEIGHT = 64;

export default function Header({
  title = "Hello, User",
  topComponent = true,
}: HeaderProps) {
  const { openSetting } = useModal();
  return (
    <View
      className="absolute inset-x-0 top-0 z-50"
      style={{ height: HEADER_HEIGHT }}
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
            <TouchableOpacity
              onPress={openSetting}
              className="rounded-full bg-slate-200 p-4"
              hitSlop={10}
              activeOpacity={0.8}
              accessibilityLabel="Profile"
              accessibilityRole="button"
              accessibilityHint="Open settings"
            >
              <UserRound size={16} color="black" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-slate-700">{title}</Text>
          </View>
        ) : (
          <View className="flex-row items-center justify-start gap-4 px-4 py-2">
            <TouchableOpacity
              onPress={() => router.back()}
              className="rounded-full bg-slate-200 p-4"
              hitSlop={10}
              activeOpacity={0.8}
              accessibilityLabel="Back"
              accessibilityRole="button"
              accessibilityHint="Go back to the previous screen"
            >
              <ArrowLeft size={16} color="black" />
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}
