import { router } from "expo-router";
import Stack from "expo-router/stack";

import { ArrowLeft } from "lucide-react-native";

import { colors } from "@/src/shared/constants/colors";
import { TouchableOpacity } from "@/src/tw";

export default function LinksLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.screen, flex: 1 },
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerLargeTitle: true,
        headerBlurEffect: "none",
        headerBackButtonDisplayMode: "minimal",
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Links",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={colors.main} />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
