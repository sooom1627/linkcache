import type { ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * React Query設定
 *
 * キャッシュ戦略:
 * - staleTime: データが「古い」とみなされるまでの時間
 * - gcTime: 未使用のキャッシュがメモリから削除されるまでの時間
 * - refetchOnWindowFocus: モバイルでは不要（バッテリー節約）
 * - refetchOnReconnect: ネットワーク復帰時に自動再フェッチ
 *
 * @see https://tanstack.com/query/latest/docs/react/guides/important-defaults
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // データの鮮度管理
      staleTime: 5 * 60 * 1000, // 5分: ほとんどのデータに適用
      gcTime: 10 * 60 * 1000, // 10分: キャッシュ保持時間

      // リトライ設定
      retry: 1, // 1回まで再試行

      // モバイル最適化
      refetchOnWindowFocus: false, // フォーカス時の再フェッチを無効
      refetchOnReconnect: true, // ネットワーク復帰時は再フェッチ
      refetchOnMount: true, // マウント時は再フェッチ

      // エラーハンドリング
      throwOnError: false, // エラーを自動でthrowしない
    },
    mutations: {
      // ミューテーションは再試行しない（冪等性が保証されていないため）
      retry: 0,
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
