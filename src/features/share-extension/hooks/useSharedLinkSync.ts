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
 * - AppState が 'active' になったときにリンク一覧を無効化して再取得します
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
          // リンク一覧を無効化して再取得
          queryClient.invalidateQueries({
            queryKey: ["links"],
          });
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [user, queryClient]);
}
