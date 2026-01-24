import { useRef, useState } from "react";

import { Pressable, Text, View } from "react-native";

import { CalendarArrowUp, Clock } from "lucide-react-native";

import { SourceTypeDropdown } from "../components/SourceTypeDropdown";
import {
  SwipeCardStack,
  type SwipeCardStackRef,
} from "../components/SwipeCardStack";
import { useSwipeTriage } from "../hooks/useSwipeTriage";

/**
 * Swipe Triage画面コンポーネント
 */
export function SwipeTriageScreen() {
  const [sourceType, setSourceType] = useState<"inbox" | "later">("inbox");
  const cardStackRef = useRef<SwipeCardStackRef>(null);

  const { cardStack, isLoading, error, handleSwipeLeft, handleSwipeRight } =
    useSwipeTriage({ sourceType });

  const handleButtonSwipeLeft = () => {
    cardStackRef.current?.swipeLeft();
  };

  const handleButtonSwipeRight = () => {
    cardStackRef.current?.swipeRight();
  };

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
          ref={cardStackRef}
          cards={cardStack}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />
      </View>

      {/* Swipe Buttons */}
      <View className="flex-row items-center justify-center gap-16 pb-4">
        <Pressable
          onPress={handleButtonSwipeLeft}
          className="items-center active:opacity-70"
        >
          <View className="size-14 items-center justify-center rounded-full border border-gray-200 bg-white">
            <Clock size={24} color="#9CA3AF" />
          </View>
          <Text className="mt-1 text-xs text-gray-400">Later</Text>
        </Pressable>
        <Pressable
          onPress={handleButtonSwipeRight}
          className="items-center active:opacity-70"
        >
          <View className="size-14 items-center justify-center rounded-full border border-gray-200 bg-white">
            <CalendarArrowUp size={24} color="#3B82F6" />
          </View>
          <Text className="mt-1 text-xs text-blue-500">Read soon</Text>
        </Pressable>
      </View>
    </View>
  );
}
