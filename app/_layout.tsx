import { Stack } from "expo-router";

import "../assets/styles/global.css";

export default function RootLayout() {
  const isAuthenticated = false;

  return (
    <Stack
      screenOptions={{ contentStyle: { backgroundColor: "white", flex: 1 } }}
    >
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="create-account" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
