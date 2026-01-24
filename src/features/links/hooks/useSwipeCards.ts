import { useCallback, useEffect, useRef, useState } from "react";

import { useMutation } from "@tanstack/react-query";
import type { SwipeDirection } from "react-native-swipeable-card-stack";

import { updateLinkStatus } from "../api/updateLinkStatus.api";
import type { UserLink } from "../types/linkList.types";

import { useLinks } from "./useLinks";

/** スワイプ履歴（Undo用） */
interface SwipeHistory {
  link: UserLink;
  direction: SwipeDirection;
}

interface UseSwipeCardsOptions {
  sourceType?: "inbox" | "later";
}

interface UseSwipeCardsReturn {
  cards: UserLink[];
  swipes: SwipeDirection[];
  isLoading: boolean;
  error: Error | null;
  handleSwipe: (item: UserLink, direction: SwipeDirection) => void;
  canUndo: boolean;
  undo: () => void;
  isUndoing: boolean;
}

/**
 * Swipeカード機能のためのシンプルなカスタムフック
 *
 * react-native-swipeable-card-stackライブラリと統合するための
 * データ取得、swipes配列管理、Undo機能を提供します。
 *
 * 重要: スワイプ中はカード一覧を固定し、invalidateQueriesを呼び出さない。
 * これにより、ライブラリのdata配列とswipes配列のインデックスがずれることを防ぐ。
 */
export function useSwipeCards(
  options: UseSwipeCardsOptions = {},
): UseSwipeCardsReturn {
  const { sourceType = "inbox" } = options;

  // swipes配列（ライブラリ用）
  const [swipes, setSwipes] = useState<SwipeDirection[]>([]);

  // スワイプ履歴（Undo用）
  const [swipeHistory, setSwipeHistory] = useState<SwipeHistory[]>([]);

  // 固定されたカード一覧（スワイプセッション中は変更しない）
  const [fixedCards, setFixedCards] = useState<UserLink[]>([]);

  // 前回のsourceTypeを追跡
  const prevSourceTypeRef = useRef(sourceType);

  // カードデータ取得
  const { links, isLoading, error } = useLinks({
    status: sourceType,
    limit: 10,
    isRead: false,
    orderBy: sourceType === "later" ? "triaged_at_asc" : null,
  });

  // カード一覧の設定ロジック
  useEffect(() => {
    // sourceTypeが変更された場合はリセット
    if (prevSourceTypeRef.current !== sourceType) {
      prevSourceTypeRef.current = sourceType;
      setFixedCards([]);
      setSwipes([]);
      setSwipeHistory([]);
      return;
    }

    // fixedCardsが空で、linksがある場合に設定
    if (fixedCards.length === 0 && links.length > 0) {
      setFixedCards(links);
      setSwipes([]);
      setSwipeHistory([]);
    }
  }, [links, sourceType, fixedCards.length]);

  // ステータス更新Mutation（invalidateQueriesを呼び出さない）
  const updateMutation = useMutation({
    mutationFn: ({
      linkId,
      status,
    }: {
      linkId: string;
      status: "inbox" | "read_soon" | "later";
    }) => updateLinkStatus(linkId, status),
    // onSuccessでinvalidateQueriesを呼び出さない
  });

  // Undo Mutation
  const undoMutation = useMutation({
    mutationFn: ({
      linkId,
      status,
    }: {
      linkId: string;
      status: "inbox" | "read_soon" | "later";
    }) => updateLinkStatus(linkId, status),
  });

  // スワイプハンドラー
  const handleSwipe = useCallback(
    (item: UserLink, direction: SwipeDirection) => {
      // swipes配列に追加
      setSwipes((prev) => [...prev, direction]);

      // 履歴に追加
      setSwipeHistory((prev) => [...prev, { link: item, direction }]);

      // 左右スワイプのみAPI呼び出し
      if (direction === "right") {
        updateMutation.mutate({ linkId: item.link_id, status: "read_soon" });
      } else if (direction === "left") {
        updateMutation.mutate({ linkId: item.link_id, status: "later" });
      }
    },
    [updateMutation],
  );

  // Undo
  const undo = useCallback(() => {
    if (swipeHistory.length === 0) return;

    const lastSwipe = swipeHistory[swipeHistory.length - 1];

    // swipes配列から削除
    setSwipes((prev) => prev.slice(0, -1));

    // 履歴から削除
    setSwipeHistory((prev) => prev.slice(0, -1));

    // 元のステータスに戻す
    undoMutation.mutate({
      linkId: lastSwipe.link.link_id,
      status: sourceType,
    });
  }, [swipeHistory, sourceType, undoMutation]);

  return {
    cards: fixedCards,
    swipes,
    isLoading: isLoading && fixedCards.length === 0,
    error,
    handleSwipe,
    canUndo: swipeHistory.length > 0,
    undo,
    isUndoing: undoMutation.isPending,
  };
}
