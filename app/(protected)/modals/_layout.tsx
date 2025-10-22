import { Stack } from "expo-router";

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "white", flex: 1 },
        animation: "fade",
        headerShown: false,
      }}
    >
      <Stack.Screen name="modal-sample" />
      <Stack.Screen name="nested-modals" />
    </Stack>
  );
}
