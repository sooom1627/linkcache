import Stack from "expo-router/stack";

export default function LinkLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: "minimal",
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="[id]" options={{ title: "Details" }} />
    </Stack>
  );
}
