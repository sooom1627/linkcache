import { Stack } from "expo-router";

import { useAuthSession } from "@/src/features/auth";
import { LoadingScreen } from "@/src/shared/components/LoadingScreen";
import { AppProviders, UIProviders } from "@/src/shared/providers";

import "../assets/styles/global.css";

/**
 * ルートレイアウト
 *
 * プロバイダー構成:
 * - UIProviders: プラットフォーム固有のUI機能（ジェスチャー、キーボード、セーフエリア、ボトムシート）
 * - AppProviders: ビジネスロジック（データ取得、モーダル管理）
 *
 * 認証状態に基づくリダイレクトは(protected)/_layout.tsxが担当
 */
export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuthSession();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <UIProviders>
      <AppProviders>
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
      </AppProviders>
    </UIProviders>
  );
}
