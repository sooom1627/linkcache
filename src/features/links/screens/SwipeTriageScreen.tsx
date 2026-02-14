import { useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  RotateCcw,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import {
  SwipeableCardStack,
  type CardProps,
  type SwipeDirection,
} from "react-native-swipeable-card-stack";

import { ErrorStateView } from "@/src/shared/components/ErrorStateView";
import { colors } from "@/src/shared/constants/colors";
import { Text, TouchableOpacity, View } from "@/src/tw";

import { SourceTypeDropdown } from "../components/SourceTypeDropdown";
import { SwipeCard } from "../components/SwipeCard";
import { useSwipeCards } from "../hooks/useSwipeCards";
import type { UserLink } from "../types/linkList.types";

/**
 * カードレンダリングコンポーネント
 * CardProps<T>はT自体を拡張するため、プロパティに直接アクセスできる
 * SwipeCardはUserLinkの必要なプロパティのみ使用するので、追加プロパティは無視される
 */
function RenderCard(props: CardProps<UserLink>) {
  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <SwipeCard link={props} />
    </View>
  );
}

interface SwipeActionButtonsProps {
  currentCard: UserLink | undefined;
  onSwipe: (item: UserLink, direction: SwipeDirection) => void;
  onUndo: () => void;
  canUndo: boolean;
}

function SwipeActionButtons({
  currentCard,
  onSwipe,
  onUndo,
  canUndo,
}: SwipeActionButtonsProps) {
  const { t } = useTranslation();
  const isDisabled = !currentCard;

  return (
    <View className="z-10 mt-[-80px] flex w-full flex-col items-center justify-start gap-2">
      <View className="flex w-full flex-row items-center justify-center gap-8">
        <TouchableOpacity
          disabled={isDisabled}
          className="flex-col items-center justify-center gap-2 p-2"
          onPress={() => {
            if (!currentCard) return;
            onSwipe(currentCard, "left");
          }}
        >
          <View
            className={`rounded-full p-4 ${
              isDisabled ? "bg-surface-muted" : "bg-surface-muted-active"
            }`}
          >
            <ArrowLeft
              size={20}
              color={isDisabled ? colors.iconMuted : colors.icon}
            />
          </View>
          <Text
            className={`flex-1 text-center font-medium ${
              isDisabled ? "text-slate-400" : "text-slate-700"
            }`}
          >
            {t("links.card.action_modal.status.stock")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={isDisabled}
          className="flex-col items-center justify-center gap-2 p-2"
          onPress={() => {
            if (!currentCard) return;
            onSwipe(currentCard, "right");
          }}
        >
          <View
            className={`rounded-full p-4 ${
              isDisabled ? "bg-surface-muted" : "bg-surface-muted-active"
            }`}
          >
            <ArrowRight
              size={20}
              color={isDisabled ? colors.iconMuted : colors.icon}
            />
          </View>
          <Text
            className={`text-center font-medium ${
              isDisabled ? "text-slate-400" : "text-slate-700"
            }`}
          >
            {t("links.card.action_modal.status.read_soon")}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={onUndo}
        disabled={!canUndo}
        className={`flex-row items-center justify-center gap-2 rounded-full px-4 py-2 ${
          canUndo
            ? "bg-surface-muted-active active:bg-surface-muted-active-pressed"
            : "bg-surface-muted opacity-50"
        }`}
      >
        <RotateCcw size={18} color={canUndo ? colors.icon : colors.iconMuted} />
        <Text
          className={`text-base font-medium ${
            canUndo ? "text-slate-700" : "text-slate-400"
          }`}
        >
          {t("links.swipeTriage.undo")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Swipe Triage画面コンポーネント
 */
export function SwipeTriageScreen() {
  const [sourceType, setSourceType] = useState<"new" | "stock" | "read_soon">(
    "new",
  );

  const { t } = useTranslation();

  const {
    cards,
    swipes,
    isLoading,
    isFetchingNextPage,
    error,
    handleSwipe,
    canUndo,
    undo,
    isAllDone,
    remainingCount,
    restart,
  } = useSwipeCards({ sourceType });

  const handleSourceTypeChange = (
    type: "new" | "stock" | "read_soon" | "done",
  ) => {
    // doneはスワイプ画面では使用しないため、newにフォールバック
    if (type === "done") {
      setSourceType("new");
      return;
    }
    setSourceType(type);
  };

  const onSwipeEnded = (item: UserLink, direction: SwipeDirection) => {
    handleSwipe(item, direction);
  };

  // Loading State
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-slate-500">{t("links.swipeTriage.loading")}</Text>
      </View>
    );
  }

  // Error State
  if (error) {
    return (
      <ErrorStateView
        message={
          error?.message ||
          t("links.dashboard.error_load_failed", {
            defaultValue: "Failed to load links. Please try again.",
          })
        }
        actionLabel={t("common.retry")}
        onAction={restart}
      />
    );
  }

  // Empty State (最初からデータが0件)
  if (cards.length === 0 && !isFetchingNextPage) {
    return (
      <View className="flex-1 items-center justify-center px-2 py-24">
        {/* Source Type Selector (Empty Stateでも表示) */}
        <View className="z-20 w-full items-center">
          <SourceTypeDropdown
            value={sourceType}
            onChange={handleSourceTypeChange}
            allowedTypes={["new", "read_soon", "stock"]}
          />
        </View>

        <View className="flex-1 items-center justify-center">
          <Text className="text-2xl font-bold text-slate-800">
            {t("links.swipeTriage.noPendingLinks")}
          </Text>
          <Text className="mt-2 text-slate-500">
            {t("links.swipeTriage.allCaughtUp")}
          </Text>
        </View>
      </View>
    );
  }

  // All Done State (全てスワイプ完了、次ページもなし)
  if (isAllDone) {
    return (
      <View className="flex-1 items-center justify-center px-2 py-24">
        {/* Source Type Selector */}
        <View className="z-20 mb-[-60px] w-full items-center">
          <SourceTypeDropdown
            value={sourceType}
            onChange={handleSourceTypeChange}
            allowedTypes={["new", "read_soon", "stock"]}
          />
        </View>

        <View className="flex-1 items-center justify-center">
          <Text className="text-2xl font-bold text-slate-800">
            {t("links.swipeTriage.allDone")}
          </Text>
          <Text className="mt-2 text-slate-500">
            {t("links.swipeTriage.triagedAll")}
          </Text>
          {/* Restart Button */}
          <TouchableOpacity
            onPress={restart}
            className="bg-surface-muted-active active:bg-surface-muted-active-pressed mt-4 flex-row items-center justify-center gap-2 rounded-full px-4 py-2"
          >
            <RefreshCw size={18} color={colors.icon} />
            <Text className="text-base font-medium text-slate-700">
              {t("links.swipeTriage.startAgain")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Main Content
  return (
    <View className="h-4/5 w-full flex-col items-center justify-between py-24">
      {/* Source Type Selector */}
      <View className="z-30 w-full items-center">
        <SourceTypeDropdown
          value={sourceType}
          onChange={handleSourceTypeChange}
          allowedTypes={["new", "read_soon", "stock"]}
        />
        {/* Remaining Count */}
        <Text className="mt-2 text-sm text-slate-500">
          {remainingCount} {t("links.swipeTriage.remaining")}
          {isFetchingNextPage ? ` ${t("links.swipeTriage.loadingMore")}` : ""}
        </Text>
      </View>

      {/* Card Stack */}
      <View
        className="z-20 mt-[-40px] flex-col px-2"
        testID="swipeable-card-stack"
      >
        <SwipeableCardStack<UserLink>
          data={cards}
          swipes={swipes}
          renderCard={RenderCard}
          keyExtractor={(item) => item.link_id}
          onSwipeEnded={onSwipeEnded}
          allowedPanDirections={["top", "bottom", "left", "right"]}
          allowedSwipeDirections={["left", "right"]}
          numberOfUnswipedCardsToRender={5}
          style={{ flex: 1 }}
        />
      </View>

      <SwipeActionButtons
        currentCard={cards[swipes.length]}
        onSwipe={handleSwipe}
        onUndo={undo}
        canUndo={canUndo}
      />
    </View>
  );
}
