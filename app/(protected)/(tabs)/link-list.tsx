import { Text } from "react-native";

import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";

export default function LinkList() {
  return (
    <ScreenContainer>
      <Text className="mb-4 text-2xl font-bold">Link List</Text>
      <Text className="mb-8 text-center text-gray-600">
        This is the link list screen.
      </Text>
    </ScreenContainer>
  );
}
