import { Stack } from "expo-router";

import { useAuth } from "@/src/features/auth";
import { LoadingScreen } from "@/src/shared/components/LoadingScreen";
import { AppProviders, UIProviders } from "@/src/shared/providers";

import "../assets/styles/global.css";

/**
 * ルートレイアウト
 *
 * プロバイダー構成:
 * - UIProviders: プラットフォーム固有のUI機能（ジェスチャー、キーボード、セーフエリア、ボトムシート）
 * - AppProviders: ビジネスロジック（データ取得、認証状態管理、モーダル管理）
 *
 * 認証状態に基づくリダイレクトは(protected)/_layout.tsxが担当
 */
function RootNavigator() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "#f8fafc", flex: 1 },
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
  );
}

export default function RootLayout() {
  return (
    <UIProviders>
      <AppProviders>
        <RootNavigator />
      </AppProviders>
    </UIProviders>
  );
}
