import { ScrollView, Text, View } from "react-native";

export default function LinkList() {
  return (
    <ScrollView className="flex-1 px-4">
      <View className="flex-1 items-center pb-12 pt-4">
        <Text className="mb-4 text-2xl font-bold">Link List</Text>
        <Text className="mb-8 text-center text-gray-600">
          This is the link list screen.
        </Text>
      </View>
    </ScrollView>
  );
}
