import { Text, View } from "react-native";

import { Link } from "expo-router";

export default function ModalSample() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text>Modal Sample</Text>
      <Link href="/modals/nested-modals">Nested Modals</Link>
    </View>
  );
}
