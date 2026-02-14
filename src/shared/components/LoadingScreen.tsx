import { ActivityIndicator } from "react-native";

import { View } from "@/src/tw";

/**
 * ローディングスクリーン
 *
 * 認証状態の確認中など、アプリ全体のローディング時に表示
 *
 * 特徴:
 * - 中央配置のスピナー
 * - プロバイダー非依存（Providerの外側でレンダリング可能）
 * - 一貫したスタイリング
 *
 * 注意:
 * このコンポーネントはUIProvidersの外側でレンダリングされるため、
 * SafeAreaProviderなどのコンテキストに依存してはいけません。
 *
 * @example
 * ```tsx
 * // app/_layout.tsx
 * if (isLoading) {
 *   return <LoadingScreen />;
 * }
 * ```
 */
export function LoadingScreen() {
  return (
    <View
      className="flex-1 items-center justify-center bg-slate-50"
      style={{ flex: 1 }}
    >
      <ActivityIndicator size="large" color="#6B7280" />
    </View>
  );
}
