import { useCallback, useEffect, useRef, useState } from "react";

import { Alert } from "react-native";

import * as Haptics from "expo-haptics";

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
  isFetchingNextPage: boolean;
  error: Error | null;
  handleSwipe: (item: UserLink, direction: SwipeDirection) => void;
  canUndo: boolean;
  undo: () => void;
  isUndoing: boolean;
  /** 全てのカードをスワイプし終わり、次ページもない状態 */
  isAllDone: boolean;
  /** 残りのスワイプ可能カード数 */
  remainingCount: number;
  /** セッションをリセットして最新データを再取得 */
  restart: () => void;
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

  // カードデータ取得（無限スクロール対応）
  const {
    links,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useLinks({
    status: sourceType,
    isRead: false,
    orderBy: sourceType === "later" ? "triaged_at_asc" : null,
  });

  // 前回処理したlinksの長さを追跡
  const prevLinksLengthRef = useRef(0);

  // カード一覧の設定ロジック
  useEffect(() => {
    // sourceTypeが変更された場合はリセット
    if (prevSourceTypeRef.current !== sourceType) {
      prevSourceTypeRef.current = sourceType;
      prevLinksLengthRef.current = 0;
      setFixedCards([]);
      setSwipes([]);
      setSwipeHistory([]);
      return;
    }

    // linksが増えた場合のみ処理
    if (links.length > prevLinksLengthRef.current) {
      if (fixedCards.length === 0) {
        // 初回設定
        setFixedCards(links);
        setSwipes([]);
        setSwipeHistory([]);
      } else {
        // 新しいリンクのみ追加（重複防止）
        const existingIds = new Set(fixedCards.map((c) => c.link_id));
        const newLinks = links.filter((l) => !existingIds.has(l.link_id));
        if (newLinks.length > 0) {
          setFixedCards((prev) => [...prev, ...newLinks]);
        }
      }
      prevLinksLengthRef.current = links.length;
    }
  }, [links, sourceType, fixedCards]);

  // 残りカード数を計算
  const remainingCount = fixedCards.length - swipes.length;

  // 残りカードが少なくなったら次ページをプリフェッチ（閾値: 3枚）
  const PREFETCH_THRESHOLD = 3;
  useEffect(() => {
    if (
      remainingCount <= PREFETCH_THRESHOLD &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [remainingCount, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // UIロールバック用の関数
  const rollbackSwipe = useCallback(() => {
    setSwipes((prev) => prev.slice(0, -1));
    setSwipeHistory((prev) => prev.slice(0, -1));
  }, []);

  // ステータス更新Mutation（invalidateQueriesを呼び出さない）
  const updateMutation = useMutation({
    mutationFn: ({
      linkId,
      status,
    }: {
      linkId: string;
      status: "inbox" | "read_soon" | "later";
    }) => updateLinkStatus(linkId, status),
    onSuccess: () => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    onError: () => {
      // 失敗時はUIをロールバック
      rollbackSwipe();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to update. Please try again.");
    },
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
    onSuccess: () => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    onError: () => {
      // Undo失敗時は再度swipeを追加（元の状態に戻す）
      // 履歴から方向を復元することはできないので、leftとして扱う
      setSwipes((prev) => [...prev, "left"]);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to undo. Please try again.");
    },
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

  // 再スタート（セッションをリセットして最新データを再取得）
  const restart = useCallback(() => {
    prevLinksLengthRef.current = 0;
    setFixedCards([]);
    setSwipes([]);
    setSwipeHistory([]);
    refetch();
  }, [refetch]);

  // 全てのカードをスワイプし終わり、次ページもない状態
  const isAllDone =
    fixedCards.length > 0 && remainingCount === 0 && !hasNextPage;

  return {
    cards: fixedCards,
    swipes,
    isLoading: isLoading && fixedCards.length === 0,
    isFetchingNextPage,
    error,
    handleSwipe,
    canUndo: swipeHistory.length > 0,
    undo,
    isUndoing: undoMutation.isPending,
    isAllDone,
    remainingCount,
    restart,
  };
}
