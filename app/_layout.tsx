import { ActivityIndicator } from "react-native";

import { Stack } from "expo-router";

import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { useAuthSession } from "@/src/features/auth";
import { QueryProvider } from "@/src/shared/providers/QueryProvider";

import "../assets/styles/global.css";

/**
 * ルートレイアウト
 * 認証状態に基づくリダイレクトは(protected)/_layout.tsxが担当
 */
export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuthSession();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }
  return (
    <QueryProvider>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: "white", flex: 1 },
            animation: "fade",
            headerShown: false,
          }}
        >
          {/* 保護されたルート */}
          <Stack.Protected guard={isAuthenticated}>
            <Stack.Screen name="(protected)" />
          </Stack.Protected>

          {/* 非保護ルート */}
          <Stack.Protected guard={!isAuthenticated}>
            <Stack.Screen name="sign-in" />
            <Stack.Screen name="create-account" />
          </Stack.Protected>
        </Stack>
      </SafeAreaProvider>
    </QueryProvider>
  );
}
