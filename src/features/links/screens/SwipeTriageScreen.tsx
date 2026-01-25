import { useState } from "react";

import { Text, TouchableOpacity, View } from "react-native";

import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  RotateCcw,
} from "lucide-react-native";
import {
  SwipeableCardStack,
  type CardProps,
  type SwipeDirection,
} from "react-native-swipeable-card-stack";

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

/**
 * Swipe Triage画面コンポーネント
 */
export function SwipeTriageScreen() {
  const [sourceType, setSourceType] = useState<"inbox" | "later" | "read_soon">(
    "inbox",
  );

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

  const handleSourceTypeChange = (type: "inbox" | "later" | "read_soon") => {
    setSourceType(type);
  };

  const onSwipeEnded = (item: UserLink, direction: SwipeDirection) => {
    handleSwipe(item, direction);
  };

  // Loading State
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-600">Loading...</Text>
      </View>
    );
  }

  // Error State
  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-600">Error: {error.message}</Text>
      </View>
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
          />
        </View>

        <View className="flex-1 items-center justify-center">
          <Text className="text-2xl font-bold text-gray-800">
            🎉 No pending links!
          </Text>
          <Text className="mt-2 text-gray-600">All caught up!</Text>
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
          />
        </View>

        <View className="flex-1 items-center justify-center">
          <Text className="text-2xl font-bold text-gray-800">🎉 All done!</Text>
          <Text className="mt-2 text-gray-600">
            You've triaged all your links!
          </Text>
          {/* Restart Button */}
          <TouchableOpacity
            onPress={restart}
            className="mt-4 flex-row items-center justify-center gap-2 rounded-full bg-slate-200 px-4 py-2 active:bg-slate-300"
          >
            <RefreshCw size={18} color="#4B5563" />
            <Text className="text-base font-medium text-slate-700">
              Start Again
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
      <View className="z-20 w-full items-center">
        <SourceTypeDropdown
          value={sourceType}
          onChange={handleSourceTypeChange}
        />
        {/* Remaining Count */}
        <Text className="mt-2 text-sm text-gray-500">
          {remainingCount} remaining
          {isFetchingNextPage ? " (loading more...)" : ""}
        </Text>
      </View>

      {/* Card Stack */}
      <View className="z-20 flex-col px-2" testID="swipeable-card-stack">
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

      {/* handle buttons */}
      <View className="z-10 mt-[-60px] flex w-full flex-col items-center justify-start gap-2">
        <View className="flex w-full flex-row items-center justify-center gap-8">
          {(() => {
            const currentCard = cards[swipes.length];
            const isDisabled = !currentCard;
            return (
              <>
                <TouchableOpacity
                  disabled={isDisabled}
                  className="flex-col items-center justify-center gap-2 p-2"
                  onPress={() => {
                    if (!currentCard) return;
                    handleSwipe(currentCard, "left");
                  }}
                >
                  <View
                    className={`rounded-full p-4 ${
                      isDisabled ? "bg-slate-100" : "bg-slate-200"
                    }`}
                  >
                    <ArrowLeft
                      size={20}
                      color={isDisabled ? "#9CA3AF" : "#4B5563"}
                    />
                  </View>
                  <Text
                    className={`flex-1 text-center font-medium ${
                      isDisabled ? "text-slate-400" : "text-slate-700"
                    }`}
                  >
                    Later
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={isDisabled}
                  className="flex-col items-center justify-center gap-2 p-2"
                  onPress={() => {
                    if (!currentCard) return;
                    handleSwipe(currentCard, "right");
                  }}
                >
                  <View
                    className={`rounded-full p-4 ${
                      isDisabled ? "bg-slate-100" : "bg-slate-200"
                    }`}
                  >
                    <ArrowRight
                      size={20}
                      color={isDisabled ? "#9CA3AF" : "#4B5563"}
                    />
                  </View>
                  <Text
                    className={`text-center font-medium ${
                      isDisabled ? "text-slate-400" : "text-slate-700"
                    }`}
                  >
                    Read Soon
                  </Text>
                </TouchableOpacity>
              </>
            );
          })()}
        </View>

        {/* Undo Button */}
        <TouchableOpacity
          onPress={undo}
          disabled={!canUndo}
          className={`flex-row items-center justify-center gap-2 rounded-full px-4 py-2 ${
            canUndo
              ? "bg-slate-200 active:bg-slate-300"
              : "bg-slate-100 opacity-50"
          }`}
        >
          <RotateCcw size={18} color={canUndo ? "#4B5563" : "#9CA3AF"} />
          <Text
            className={`text-base font-medium ${
              canUndo ? "text-slate-700" : "text-slate-400"
            }`}
          >
            Undo
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
