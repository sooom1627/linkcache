import { Text, View } from "react-native";

import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";

export default function Swipes() {
  return (
    <ScreenContainer scrollable={true} headerTitle="Swipes">
      <Text className="mb-8 text-center text-gray-600">
        This is the swipes screen.
      </Text>

      {Array.from({ length: 25 }).map((_, index) => (
        <View key={index} className="mb-4">
          <Text className="text-lg font-bold">Swipe {index + 1}</Text>
          <Text className="text-sm text-gray-500">Description {index + 1}</Text>
        </View>
      ))}
    </ScreenContainer>
  );
}
