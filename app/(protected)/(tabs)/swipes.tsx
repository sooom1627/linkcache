import { Text, View } from "react-native";

import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";

export default function Swipes() {
  return (
    <ScreenContainer scrollable={false} headerTitle="Swipes">
      <View className="flex-1 pb-28 pt-16">
        <Text className="text-center text-gray-600">
          This is the swipes screen.
        </Text>
      </View>
    </ScreenContainer>
  );
}
