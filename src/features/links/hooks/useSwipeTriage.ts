import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateLinkStatus } from "../api/updateLinkStatus.api";
import { linkQueryKeys } from "../constants/queryKeys";
import type { TriageStatus } from "../types/linkList.types";

import { useLinks } from "./useLinks";

/**
 * Swipe Triage機能のためのカスタムフック
 *
 * Inbox状態のリンクを取得し、ステータス更新（read_soon/later）を提供します。
 *
 * @returns Swipe Triage関連の状態とハンドラー関数
 *
 * @example
 * ```tsx
 * const { currentLink, isLoading, handleSwipeRight, handleSwipeLeft } = useSwipeTriage();
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
export function useSwipeTriage() {
  const queryClient = useQueryClient();

  // Inboxのリンクを1件取得
  const { links, isLoading, error } = useLinks({
    status: "inbox",
    limit: 1,
  });

  const currentLink = links[0] ?? null;

  // ステータス更新Mutation
  const updateMutation = useMutation({
    mutationFn: ({
      linkId,
      status,
    }: {
      linkId: string;
      status: TriageStatus;
    }) => updateLinkStatus(linkId, status),
    onSuccess: () => {
      // リンク一覧のキャッシュを無効化して再取得
      queryClient.invalidateQueries({ queryKey: linkQueryKeys.list() });
    },
  });

  const handleSwipe = (linkId: string, status: TriageStatus) => {
    updateMutation.mutate({ linkId, status });
  };

  return {
    currentLink,
    isLoading,
    error,
    isUpdating: updateMutation.isPending,
    handleSwipeRight: (linkId: string) => handleSwipe(linkId, "read_soon"),
    handleSwipeLeft: (linkId: string) => handleSwipe(linkId, "later"),
  };
}
