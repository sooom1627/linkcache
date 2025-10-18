import { ScrollView, Text, View } from "react-native";

const sampleData = [
  {
    id: 1,
    title: "Swipes",
    description: "Swipes",
  },
  {
    id: 2,
    title: "Swipes",
    description: "Swipes",
  },
  {
    id: 3,
    title: "Swipes",
    description: "Swipes",
  },
  {
    id: 4,
    title: "Swipes",
    description: "Swipes",
  },
  {
    id: 5,
    title: "Swipes",
    description: "Swipes",
  },
  {
    id: 6,
    title: "Swipes",
    description: "Swipes",
  },
  {
    id: 7,
    title: "Swipes",
    description: "Swipes",
  },
  {
    id: 8,
    title: "Swipes",
    description: "Swipes",
  },
  {
    id: 9,
    title: "Swipes",
    description: "Swipes",
  },
  {
    id: 10,
    title: "Swipes",
    description: "Swipes",
  },
];

export default function Swipes() {
  return (
    <ScrollView className="flex-1 px-4">
      <View className="flex-1 items-center pb-12 pt-4">
        <Text className="mb-4 text-2xl font-bold">Swipes</Text>
        <Text className="mb-8 text-center text-gray-600">
          This is the swipes screen.
        </Text>
        {sampleData.map((item) => (
          <View
            key={item.id}
            className="my-10 flex-row items-center justify-around gap-4"
          >
            <Text className="text-2xl font-bold">{item.title}</Text>
            <Text className="text-sm text-gray-500">{item.description}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
