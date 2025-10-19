import { Text } from "react-native";

import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";

export default function Dashboard() {
  return (
    <ScreenContainer headerTitle="Dashboard">
      <Text className="mb-8 text-center text-gray-600">
        This is the dashboard screen.
      </Text>
    </ScreenContainer>
  );
}
