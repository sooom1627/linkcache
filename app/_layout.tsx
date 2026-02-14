import { Stack } from "expo-router";
import * as SystemUI from "expo-system-ui";

import { useAuth } from "@/src/features/auth";
import { LoadingScreen } from "@/src/shared/components/LoadingScreen";
import { colors } from "@/src/shared/constants/colors";
import { AppProviders, UIProviders } from "@/src/shared/providers";

import "../assets/styles/global.css";

// ルートビュー（React ツリー外のネイティブ層）の背景色を設定
SystemUI.setBackgroundColorAsync(colors.screen);

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
        contentStyle: { backgroundColor: colors.screen, flex: 1 },
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
