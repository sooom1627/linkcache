import { Stack } from "expo-router";

import { SafeAreaView } from "react-native-safe-area-context";

export default function LinksLayout() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "right", "left"]}>
      <Stack
        screenOptions={{
          animation: "slide_from_right",
          presentation: "card",
        }}
      >
        <Stack.Screen
          name="index"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
      </Stack>
    </SafeAreaView>
  );
}
