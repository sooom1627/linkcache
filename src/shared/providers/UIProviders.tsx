import type { PropsWithChildren } from "react";

import { KeyboardAvoidingView, Platform } from "react-native";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

/**
 * UI層プロバイダー
 *
 * プラットフォーム固有のUI関連機能を提供:
 * - ジェスチャーハンドリング（GestureHandler）
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
  return (
    <GestureHandlerRootView className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        className="flex-1"
      >
        <SafeAreaProvider>{children}</SafeAreaProvider>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}
