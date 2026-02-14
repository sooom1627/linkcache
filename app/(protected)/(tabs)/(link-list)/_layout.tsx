import Stack from "expo-router/stack";

import { AvatarHeaderButton } from "@/src/shared/components/AvatarHeaderButton";
import { colors } from "@/src/shared/constants/colors";

export default function LinkListStack() {
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
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Links",
          headerLeft: () => <AvatarHeaderButton />,
        }}
      />
    </Stack>
  );
}
