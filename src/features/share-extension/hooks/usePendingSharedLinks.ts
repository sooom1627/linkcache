import { useCallback, useEffect, useRef } from "react";

import { AppState, Platform, type AppStateStatus } from "react-native";

import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/src/features/auth";
import { createLinkWithStatus } from "@/src/features/links/api/createLink.api";
import { linkQueryKeys } from "@/src/features/links/constants/queryKeys";
import { fetchOgpMetadata } from "@/src/features/links/utils/metadata";
import { normalizeUrl } from "@/src/features/links/utils/normalizeUrl";

import type { SharedItem } from "../types/sharedItem.types";
import {
  deleteProcessedItem,
  readPendingSharedItems,
} from "../utils/appGroupReader";

/**
 * 共有アイテムを処理するフック
 *
 * アプリ起動時およびフォアグラウンド復帰時に App Group から
 * 未処理の共有アイテムを読み取り、リンクとして保存します。
 *
 * @example
 * ```tsx
 * function App() {
 *   usePendingSharedLinks();
 *   return <MainApp />;
 * }
 * ```
 */
export function usePendingSharedLinks(): void {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const isProcessingRef = useRef(false);

  /**
   * 単一の共有アイテムを処理する
   */
  const processSharedItem = useCallback(
    async (item: SharedItem): Promise<boolean> => {
      try {
        // URL を正規化
        const normalizedUrl = normalizeUrl(item.url);

        // OGP メタデータを取得
        const metadata = await fetchOgpMetadata(normalizedUrl);

        // リンクを作成
        await createLinkWithStatus({
          url: normalizedUrl,
          title: metadata?.title ?? null,
          description: metadata?.description ?? null,
          image_url: metadata?.image_url ?? null,
          favicon_url: metadata?.favicon_url ?? null,
          site_name: metadata?.site_name ?? null,
        });

        // 成功時のみファイルを削除
        await deleteProcessedItem(item.id);

        console.log(`[ShareExtension] Processed shared item: ${item.id}`);
        return true;
      } catch (error) {
        // 失敗時はファイルを残して次回再試行
        console.error(
          `[ShareExtension] Failed to process shared item: ${item.id}`,
          error,
        );
        return false;
      }
    },
    [],
  );

  /**
   * 全ての未処理共有アイテムを処理する
   */
  const processPendingLinks = useCallback(async (): Promise<void> => {
    // iOS 以外では処理しない
    if (Platform.OS !== "ios") {
      return;
    }

    // 未認証の場合は処理しない
    if (!session?.user) {
      return;
    }

    // 処理中フラグで重複実行を防止
    if (isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;

    try {
      // 未処理の共有アイテムを読み取り
      const sharedItems = await readPendingSharedItems();

      if (sharedItems.length === 0) {
        return;
      }

      console.log(
        `[ShareExtension] Processing ${sharedItems.length} pending shared items`,
      );

      let processedCount = 0;

      // 各アイテムを順番に処理
      for (const item of sharedItems) {
        const success = await processSharedItem(item);
        if (success) {
          processedCount++;
        }
      }

      // 1件以上処理成功した場合はリンク一覧を更新
      if (processedCount > 0) {
        await queryClient.invalidateQueries({
          queryKey: linkQueryKeys.lists(),
        });
        console.log(
          `[ShareExtension] Successfully processed ${processedCount} items`,
        );
      }
    } catch (error) {
      console.error("[ShareExtension] Failed to process pending links", error);
    } finally {
      isProcessingRef.current = false;
    }
  }, [session?.user, processSharedItem, queryClient]);

  useEffect(() => {
    // マウント時に処理
    processPendingLinks();

    // AppState の変更を監視
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        // フォアグラウンドに復帰した時に処理
        if (nextAppState === "active") {
          processPendingLinks();
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [processPendingLinks]);
}
