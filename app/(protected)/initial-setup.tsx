import { View } from "react-native";

import { SetupProfileScreen } from "@/src/features/users";

export default function InitialSetup() {
  return (
    <View className="flex-1 bg-white p-4">
      <SetupProfileScreen />
    </View>
  );
}
