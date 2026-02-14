import Stack from "expo-router/stack";

export default function LinksLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: "minimal",
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Links" }} />
    </Stack>
  );
}
