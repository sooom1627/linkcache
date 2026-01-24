import { useState } from "react";

import { Text, TouchableOpacity, View } from "react-native";

import { RotateCcw } from "lucide-react-native";
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
  const [sourceType, setSourceType] = useState<"inbox" | "later">("inbox");

  const { cards, swipes, isLoading, error, handleSwipe, canUndo, undo } =
    useSwipeCards({ sourceType });

  const handleSourceTypeChange = (type: "inbox" | "later") => {
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

  // Empty State (Inbox Zero)
  if (cards.length === 0) {
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

  // Main Content
  return (
    <View className="flex-1 px-2 py-24">
      {/* Source Type Selector */}
      <View className="z-20 w-full items-center pb-4">
        <SourceTypeDropdown
          value={sourceType}
          onChange={handleSourceTypeChange}
        />
      </View>

      {/* Card Stack */}
      <View className="flex-1 flex-col px-2" testID="swipeable-card-stack">
        <SwipeableCardStack<UserLink>
          data={cards}
          swipes={swipes}
          renderCard={RenderCard}
          keyExtractor={(item) => item.link_id}
          onSwipeEnded={onSwipeEnded}
          allowedPanDirections={["left", "right"]}
          allowedSwipeDirections={["left", "right"]}
          numberOfUnswipedCardsToRender={5}
          style={{ flex: 1 }}
        />
      </View>

      {/* Undo Button */}
      <TouchableOpacity
        onPress={undo}
        disabled={!canUndo}
        className={`mb-4 flex-row items-center justify-center gap-2 rounded-full px-4 py-2 ${
          canUndo ? "bg-gray-200 active:bg-gray-300" : "bg-gray-100 opacity-50"
        }`}
      >
        <RotateCcw size={18} color={canUndo ? "#4B5563" : "#9CA3AF"} />
        <Text
          className={`text-base font-medium ${
            canUndo ? "text-gray-700" : "text-gray-400"
          }`}
        >
          Undo
        </Text>
      </TouchableOpacity>
    </View>
  );
}
