import Stack from "expo-router/stack";

import { AvatarHeaderButton } from "@/src/shared/components/AvatarHeaderButton";

export default function SwipesStack() {
  return (
    <Stack
      screenOptions={{
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
          title: "Swipes",
          headerLeft: () => <AvatarHeaderButton />,
        }}
      />
    </Stack>
  );
}
