import { useMemo } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateLinkStatus } from "../api/updateLinkStatus.api";
import { linkQueryKeys } from "../constants/queryKeys";
import type { TriageStatus, UserLink } from "../types/linkList.types";

import { useLinks } from "./useLinks";

/**
 * useLinksのクエリデータ型
 */
interface LinksQueryData {
  data: UserLink[];
  hasMore: boolean;
  totalCount: number;
}

/**
 * Swipe Triage機能のためのカスタムフック
 *
 * InboxまたはLater状態のリンクを取得し、ステータス更新（read_soon/later）を提供します。
 *
 * @param options - オプション
 * @param options.sourceType - トリアージするリンクのソースタイプ（デフォルト: "inbox"）
 * @returns Swipe Triage関連の状態とハンドラー関数
 *
 * @example
 * ```tsx
 * const { currentLink, isLoading, handleSwipeRight, handleSwipeLeft } = useSwipeTriage();
 *
 * // Laterのリンクをトリアージする場合
 * const { currentLink } = useSwipeTriage({ sourceType: "later" });
 *
 * if (currentLink) {
 *   return (
 *     <View>
 *       <Text>{currentLink.title}</Text>
 *       <Button onPress={() => handleSwipeRight(currentLink.link_id)}>Read Soon</Button>
 *       <Button onPress={() => handleSwipeLeft(currentLink.link_id)}>Later</Button>
 *     </View>
 *   );
 * }
 * ```
 */
export function useSwipeTriage(options?: { sourceType?: "inbox" | "later" }) {
  const queryClient = useQueryClient();
  const sourceType = options?.sourceType ?? "inbox";

  // 指定されたソースタイプのリンクを5件取得（スタック表示用）
  const {
    links: rawLinks,
    isLoading,
    error,
  } = useLinks({
    status: sourceType,
    limit: 5,
    isRead: false,
  });

  // inboxの場合はtriaged_atが古い順にソート（更新日が古いものから表示）
  const links = useMemo(() => {
    if (sourceType === "inbox") {
      return [...rawLinks].sort((a, b) => {
        // triaged_atがnullの場合は最後に
        if (!a.triaged_at && !b.triaged_at) return 0;
        if (!a.triaged_at) return 1;
        if (!b.triaged_at) return -1;
        // 古い順（昇順）
        return (
          new Date(a.triaged_at).getTime() - new Date(b.triaged_at).getTime()
        );
      });
    }
    return rawLinks;
  }, [rawLinks, sourceType]);

  const currentLink = links[0] ?? null;
  const nextLink = links[1] ?? null;
  const queuedLink = links[2] ?? null;

  // ステータス更新Mutation
  const updateMutation = useMutation({
    mutationFn: ({
      linkId,
      status,
    }: {
      linkId: string;
      status: TriageStatus;
    }) => updateLinkStatus(linkId, status),
    onMutate: async ({ linkId, status }) => {
      // 楽観的更新: スワイプしたカードを即座にキャッシュから削除
      const triageQueryKey = linkQueryKeys.listLimited({
        status: sourceType,
        limit: 5,
        isRead: false,
      });

      // 進行中のクエリをキャンセル
      await queryClient.cancelQueries({ queryKey: triageQueryKey });

      // 現在のキャッシュを取得（ロールバック用）
      const previousTriageData =
        queryClient.getQueryData<LinksQueryData>(triageQueryKey);

      // スワイプしたカードのデータを保存（Read Soonタブに追加するため）
      const swipedCard = previousTriageData?.data.find(
        (link) => link.link_id === linkId,
      );

      // Swipe Triageキャッシュを更新（スワイプしたカードを削除）
      queryClient.setQueryData<LinksQueryData>(triageQueryKey, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((link) => link.link_id !== linkId),
        };
      });

      // Read Soonタブのキャッシュを更新（右スワイプ時）
      let previousReadSoonData: LinksQueryData | undefined;
      if (status === "read_soon" && swipedCard) {
        const readSoonQueryKey = linkQueryKeys.listLimited({
          status: "read_soon",
          limit: 5,
          isRead: false,
        });
        previousReadSoonData =
          queryClient.getQueryData<LinksQueryData>(readSoonQueryKey);

        // Read Soonタブに追加（先頭に挿入）
        queryClient.setQueryData<LinksQueryData>(readSoonQueryKey, (old) => {
          if (!old?.data) return old;

          // ステータスを更新して先頭に追加
          const updatedCard: UserLink = { ...swipedCard, status: "read_soon" };
          const newData = [updatedCard, ...old.data].slice(0, 5); // 最大5件

          return {
            ...old,
            data: newData,
            totalCount: old.totalCount + 1,
          };
        });
      }

      return {
        previousTriageData,
        previousReadSoonData,
        triageQueryKey,
      };
    },
    onError: (_err, _variables, context) => {
      // エラー時はキャッシュをロールバック
      if (context?.previousTriageData) {
        const triageQueryKey = linkQueryKeys.listLimited({
          status: sourceType,
          limit: 5,
          isRead: false,
        });
        queryClient.setQueryData(triageQueryKey, context.previousTriageData);
      }
      // Read Soonタブのロールバック
      if (context?.previousReadSoonData) {
        const readSoonQueryKey = linkQueryKeys.listLimited({
          status: "read_soon",
          limit: 5,
          isRead: false,
        });
        queryClient.setQueryData(
          readSoonQueryKey,
          context.previousReadSoonData,
        );
      }
    },
    onSettled: () => {
      // 成功・失敗に関わらず、すべての関連キャッシュを無効化して最新データを再取得
      // 無限スクロールの全リスト
      queryClient.invalidateQueries({ queryKey: linkQueryKeys.lists() });
    },
  });

  const handleSwipe = (linkId: string, status: TriageStatus) => {
    updateMutation.mutate({ linkId, status });
  };

  return {
    currentLink,
    nextLink,
    queuedLink,
    cardStack: [currentLink, nextLink, queuedLink].filter(
      (link): link is NonNullable<typeof link> => link !== null,
    ),
    isLoading,
    error,
    isUpdating: updateMutation.isPending,
    handleSwipeRight: (linkId: string) => handleSwipe(linkId, "read_soon"),
    handleSwipeLeft: (linkId: string) => handleSwipe(linkId, "later"),
  };
}
