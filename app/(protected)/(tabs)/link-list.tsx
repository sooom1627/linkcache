import { Text, View } from "react-native";

import { FlashList } from "@shopify/flash-list";

import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";

const sampleData = [
  { id: 1, title: "Link 1", description: "Description 1" },
  { id: 2, title: "Link 2", description: "Description 2" },
  { id: 3, title: "Link 3", description: "Description 3" },
  { id: 4, title: "Link 4", description: "Description 4" },
  { id: 5, title: "Link 5", description: "Description 5" },
  { id: 6, title: "Link 6", description: "Description 6" },
  { id: 7, title: "Link 7", description: "Description 7" },
  { id: 8, title: "Link 8", description: "Description 8" },
  { id: 9, title: "Link 9", description: "Description 9" },
  { id: 10, title: "Link 10", description: "Description 10" },
  { id: 11, title: "Link 11", description: "Description 11" },
  { id: 12, title: "Link 12", description: "Description 12" },
  { id: 13, title: "Link 13", description: "Description 13" },
  { id: 14, title: "Link 14", description: "Description 14" },
  { id: 15, title: "Link 15", description: "Description 15" },
  { id: 16, title: "Link 16", description: "Description 16" },
  { id: 17, title: "Link 17", description: "Description 17" },
];

export default function LinkList() {
  return (
    <ScreenContainer scrollable={false} centerContent={false} noPaddingBottom>
      <View className="flex-col items-center justify-center gap-4">
        <Text className="text-2xl font-bold">Link List</Text>
        <Text className="text-center text-gray-600">
          This is the link list screen.
        </Text>
      </View>
      <FlashList
        className="flex-1"
        data={sampleData}
        keyExtractor={(it) => String(it.id)}
        contentContainerClassName="pb-28"
        renderItem={({ item }) => (
          <View className="mb-4 rounded-lg bg-gray-100 p-4">
            <Text className="text-lg font-bold">{item.title}</Text>
            <Text className="text-sm text-gray-500">{item.description}</Text>
          </View>
        )}
      />
    </ScreenContainer>
  );
}
