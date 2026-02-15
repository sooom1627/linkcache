import { Stack } from "expo-router";

import { SafeAreaView } from "react-native-safe-area-context";

export default function CollectionsLayout() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "right", "left"]}>
      <Stack
        screenOptions={{
          animation: "slide_from_right",
          presentation: "card",
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
    </SafeAreaView>
  );
}
