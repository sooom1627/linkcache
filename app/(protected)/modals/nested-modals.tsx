import { Text, TouchableOpacity, View } from "react-native";

import { router } from "expo-router";

export default function NestedModals() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text>Nested Modals</Text>
      <TouchableOpacity onPress={() => router.back()}>
        <Text>Back</Text>
      </TouchableOpacity>
    </View>
  );
}
