import type { PropsWithChildren } from "react";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "@/src/features/auth";
import { useSharedLinkSync } from "@/src/features/share-extension";

import { ModalProvider } from "./ModalProvider";

/**
 * React Query設定
 *
 * キャッシュ戦略:
 * - staleTime: データが「古い」とみなされるまでの時間（30分）
 *   → Supabase Egress削減のため延長
 * - gcTime: 未使用のキャッシュがメモリから削除されるまでの時間（60分）
 * - refetchOnWindowFocus: モバイルでは不要（バッテリー節約）
 * - refetchOnReconnect: ネットワーク復帰時に自動再フェッチ
 * - refetchOnMount: true - stale状態のデータのみ再フェッチ
 *   → invalidateQueries後の自動更新を有効化
 *
 * データ更新フロー:
 * 1. mutation成功時にinvalidateQueries()でキャッシュをstale化
 * 2. 画面遷移時、staleなクエリのみ自動refetch
 * 3. staleTime内のデータはキャッシュから即座に返却（API呼び出しなし）
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000, // 30分: Egress削減のため延長
      gcTime: 60 * 60 * 1000, // 60分: キャッシュ保持時間（staleTimeより長く）
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true, // invalidateQueries後の自動refetchを有効化（stale時のみrefetch）
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
 * - 認証状態管理（Auth）
 * - ボトムシートモーダル（BottomSheet）
 * - グローバルモーダル管理（Modal）
 *
 * 責任範囲: 「何を表示するか」— ビジネスロジック、状態管理
 *
 * プロバイダーの順序:
 * 1. QueryClientProvider - データ取得・キャッシュ管理の基盤
 * 2. AuthProvider - 認証状態管理（QueryClientの外側でも機能するが、ここに配置）
 * 3. BottomSheetModalProvider - モーダルUIの基盤（QueryClient/Authに依存する可能性があるため内側）
 * 4. ModalProvider - グローバルモーダル管理（上記すべてに依存）
 *
 * Share Extension 統合:
 * - SharedLinkProcessor コンポーネントで共有リンクを処理
 * - アプリ起動時・フォアグラウンド復帰時に App Group から読み取り
 *
 * 将来的な拡張候補:
 * - テーマプロバイダー（Theme）
 * - 国際化プロバイダー（i18n）
 * - 通知プロバイダー（Notification）
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
/**
 * 共有リンク処理コンポーネント
 *
 * Share Extension から共有された URL を処理します。
 * AuthProvider の内側で動作し、認証済みの場合のみ処理を行います。
 */
function SharedLinkProcessor({ children }: PropsWithChildren) {
  useSharedLinkSync();
  return <>{children}</>;
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SharedLinkProcessor>
          <BottomSheetModalProvider>
            <ModalProvider>{children}</ModalProvider>
          </BottomSheetModalProvider>
        </SharedLinkProcessor>
      </AuthProvider>
    </QueryClientProvider>
  );
}
