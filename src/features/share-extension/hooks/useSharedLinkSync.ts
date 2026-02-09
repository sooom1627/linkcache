import { useEffect } from "react";

import { AppState, Platform, type AppStateStatus } from "react-native";

import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/src/features/auth";

/**
 * Share Extension から共有されたリンクを同期するフック
 *
 * ShareExtension が Supabase 経由で保存したリンクを、
 * メインアプリでアクティブになったときに自動的に取得します。
 *
 * @remarks
 * - iOS のみで動作します
 * - 認証済みユーザーのみリンク一覧を再取得します
 * - AppState が 'active' になったときにリンク一覧を無効化（非同期）
 * - 画面フォーカス時の refetch とは独立して動作
 *
 * @example
 * ```tsx
 * function App() {
 *   useSharedLinkSync();
 *   return <MainApp />;
 * }
 * ```
 */
export function useSharedLinkSync(): void {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    // iOS 以外では何もしない
    if (Platform.OS !== "ios") {
      return;
    }

    // AppState の変更を監視
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        // フォアグラウンドに復帰した時、かつ認証済みの場合
        if (nextAppState === "active" && user) {
          // 非同期で無効化（画面レンダリングをブロックしない）
          // setImmediate で次のイベントループで実行
          //
          // パフォーマンス最適化:
          // - invalidateQueries はキャッシュを stale にマークするだけ
          // - refetchType: 'none' により即時refetchを防止
          // - 実際の再取得は次回画面マウント時（stale状態なので）に自動refetch
          // - これにより重複したネットワークリクエストを防止
          // - アプリ復帰直後の画面レンダリングに影響しない
          setImmediate(() => {
            queryClient.invalidateQueries({
              queryKey: ["links"],
              refetchType: "none", // stale化のみ、即時refetchなし
            });
          });
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [user, queryClient]);
}
