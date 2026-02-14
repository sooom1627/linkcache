import { useEffect, useState, type PropsWithChildren } from "react";

import { Platform } from "react-native";

import { I18nextProvider } from "react-i18next";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LoadingScreen } from "@/src/shared/components/LoadingScreen";
import { colors } from "@/src/shared/constants/colors";
import i18n from "@/src/shared/utils/i18n";
import { initLanguageFromStorage } from "@/src/shared/utils/langSetting";
import { GestureHandlerRootView, KeyboardAvoidingView } from "@/src/tw";

/**
 * UI層プロバイダー
 *
 * プラットフォーム固有のUI関連機能を提供:
 * - ジェスチャーハンドリング（GestureHandler）
 * - 国際化・多言語対応（I18next）
 * - キーボード回避動作（KeyboardAvoiding）
 * - セーフエリア管理（SafeArea）
 *
 * 責任範囲: 「どう表示するか」— React Native固有のUI機能
 *
 * 注意:
 * BottomSheetModalProviderはAppProvidersに移動しました。
 * 理由: BottomSheetModal内でReact Queryなどのビジネスロジックプロバイダーを
 * 使用するため、QueryClientProviderの子孫である必要があります。
 *
 * @example
 * ```tsx
 * // app/_layout.tsx
 * <UIProviders>
 *   <AppProviders>
 *     <App />
 *   </AppProviders>
 * </UIProviders>
 * ```
 */
export function UIProviders({ children }: PropsWithChildren) {
  const [isLanguageReady, setIsLanguageReady] = useState(false);

  useEffect(() => {
    // アプリ起動時に保存された言語設定を読み込む
    initLanguageFromStorage()
      .then(() => {
        setIsLanguageReady(true);
      })
      .catch((error) => {
        console.error("言語初期化エラー:", error);
        // エラーが発生してもアプリは起動させる
        setIsLanguageReady(true);
      });
  }, []);

  // 言語設定の読み込みが完了するまでローディング画面を表示
  if (!isLanguageReady) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.screen }}>
      <I18nextProvider i18n={i18n}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
          className="flex-1"
          style={{ flex: 1 }}
        >
          <SafeAreaProvider>{children}</SafeAreaProvider>
        </KeyboardAvoidingView>
      </I18nextProvider>
    </GestureHandlerRootView>
  );
}
