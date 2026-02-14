import Stack from "expo-router/stack";

import { AvatarHeaderButton } from "@/src/shared/components/AvatarHeaderButton";

export default function HomeStack() {
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
          title: "Home",
          headerLeft: () => <AvatarHeaderButton />,
        }}
      />
    </Stack>
  );
}
