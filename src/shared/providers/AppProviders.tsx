import type { PropsWithChildren } from "react";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ModalProvider } from "./ModalProvider";

/**
 * React Query設定
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      throwOnError: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * アプリケーション層プロバイダー
 *
 * ビジネスロジックとアプリケーション機能を提供:
 * - データフェッチング・キャッシュ管理（Query）
 * - ボトムシートモーダル（BottomSheet）
 * - グローバルモーダル管理（Modal）
 *
 * 責任範囲: 「何を表示するか」— ビジネスロジック、状態管理
 *
 * プロバイダーの順序:
 * 1. QueryClientProvider - データ取得・キャッシュ管理の基盤
 * 2. BottomSheetModalProvider - モーダルUIの基盤（QueryClientに依存する可能性があるため内側）
 * 3. ModalProvider - グローバルモーダル管理（上記両方に依存）
 *
 * 将来的な拡張候補:
 * - テーマプロバイダー（Theme）
 * - 国際化プロバイダー（i18n）
 * - 通知プロバイダー（Notification）
 * - 認証状態プロバイダー（Auth）
 *
 * @example
 * ```tsx
 * // app/_layout.tsx
 * <UIProviders>
 *   <AppProviders>
 *     <Stack>...</Stack>
 *   </AppProviders>
 * </UIProviders>
 * ```
 */
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <BottomSheetModalProvider>
        <ModalProvider>{children}</ModalProvider>
      </BottomSheetModalProvider>
    </QueryClientProvider>
  );
}
