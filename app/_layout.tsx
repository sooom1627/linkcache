import { Stack } from "expo-router";

import { SafeAreaProvider } from "react-native-safe-area-context";

import { useAuthSession } from "@/src/features/auth";
import { QueryProvider } from "@/src/shared/providers/QueryProvider";

import "../assets/styles/global.css";

/**
 * ルートレイアウト
 * 認証状態に基づくリダイレクトは(protected)/_layout.tsxが担当
 */
export default function RootLayout() {
  const { isAuthenticated } = useAuthSession();
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
