import { useState } from "react";

import { Text, View } from "react-native";

import { SourceTypeDropdown } from "../components/SourceTypeDropdown";
import { SwipeCardStack } from "../components/SwipeCardStack";
import { useSwipeTriage } from "../hooks/useSwipeTriage";

/**
 * Swipe Triage画面コンポーネント
 *
 * Step 4: カードスタックとOGP画像表示
 */
export function SwipeTriageScreen() {
  const [sourceType, setSourceType] = useState<"inbox" | "later">("inbox");

  const { cardStack, isLoading, error, handleSwipeLeft, handleSwipeRight } =
    useSwipeTriage({ sourceType });

  const handleSourceTypeChange = (type: "inbox" | "later") => {
    setSourceType(type);
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
  if (cardStack.length === 0) {
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
    <View className="flex-1 items-center justify-start px-2 py-24">
      {/* Source Type Selector */}
      <View className="z-20 w-full items-center">
        <SourceTypeDropdown
          value={sourceType}
          onChange={handleSourceTypeChange}
        />
      </View>

      {/* Card Stack */}
      <View className="w-full flex-1 items-center justify-center">
        <SwipeCardStack
          cards={cardStack}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />
      </View>
    </View>
  );
}
