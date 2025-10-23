import { TouchableOpacity } from "react-native";

import { router, Stack } from "expo-router";

import { X } from "lucide-react-native";

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: "Modals",
        headerStyle: {
          backgroundColor: "white",
        },
        headerBackButtonDisplayMode: "minimal",
        headerBlurEffect: "systemMaterialLight",
        headerRight: () => (
          <TouchableOpacity
            onPress={() => router.back()}
            className="size-10 flex-row items-center justify-center"
          >
            <X size={24} color="black" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="nested-modals" />
    </Stack>
  );
}
