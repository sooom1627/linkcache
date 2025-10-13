import { Stack } from "expo-router";

import { SafeAreaProvider } from "react-native-safe-area-context";

import { useAuthSession } from "@/src/features/auth/hooks/useAuthSession";
import { QueryProvider } from "@/src/shared/providers/QueryProvider";

import "../assets/styles/global.css";

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuthSession();

  if (isLoading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "white", flex: 1 },
        animation: "fade",
        headerShown: false,
      }}
    >
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="setup-profile" />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="create-account" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </QueryProvider>
  );
}
