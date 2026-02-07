import { useEffect, useState, type ReactNode } from "react";

import NetInfo from "@react-native-community/netinfo";
import {
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

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
 *
 * 注意:
 * - 一部のクエリ（例: useProfile）は個別にstaleTime: Infinityを設定
 * - これらは明示的なinvalidate時のみ更新される
 * - staleTimeを過ぎたデータは自動的に再フェッチされるため、データの鮮度は保たれる
 *
 * HMR対応:
 * - Provider内でuseStateを使用して初期化することで、Fast Refresh時の問題を回避
 * - 各Providerツリーが独立したクライアントを持つため、将来の拡張にも対応
 *
 * @see https://tanstack.com/query/latest/docs/react/guides/important-defaults
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // データの鮮度管理
        staleTime: 30 * 60 * 1000, // 30分: Egress削減のため延長
        gcTime: 60 * 60 * 1000, // 60分: キャッシュ保持時間（staleTimeより長く）

        // リトライ設定
        retry: 1, // 1回まで再試行

        // モバイル最適化
        refetchOnWindowFocus: false, // フォーカス時の再フェッチを無効
        refetchOnReconnect: true, // ネットワーク復帰時は再フェッチ
        refetchOnMount: true, // invalidateQueries後の自動refetchを有効化（stale時のみrefetch）

        // エラーハンドリング
        throwOnError: false, // エラーを自動でthrowしない
      },
      mutations: {
        // ミューテーションは再試行しない（冪等性が保証されていないため）
        retry: 0,
      },
    },
  });
}

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [client] = useState(() => createQueryClient());

  // React Native環境でのネットワーク再接続検知
  // refetchOnReconnect: trueを機能させるために必須
  useEffect(() => {
    return onlineManager.setEventListener((setOnline) => {
      return NetInfo.addEventListener((state) => {
        setOnline(Boolean(state.isConnected));
      });
    });
  }, []);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
