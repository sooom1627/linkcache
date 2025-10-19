import { ActivityIndicator } from "react-native";

import { Stack } from "expo-router";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { useAuthSession } from "@/src/features/auth";
import { ModalProvider, QueryProvider } from "@/src/shared/providers";

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <SafeAreaProvider>
          <BottomSheetModalProvider>
            <ModalProvider>
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
            </ModalProvider>
          </BottomSheetModalProvider>
        </SafeAreaProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
