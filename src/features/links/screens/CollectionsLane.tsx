import { ScrollView, Text, View } from "react-native";

import { useRouter } from "expo-router";

import { CollectionChip } from "../components/CollectionChip";

import { mockCollections } from "./CollectionDetailScreen";

export function CollectionsLane() {
  const router = useRouter();
  const collections = Object.values(mockCollections);

  return (
    <View>
      <Text className="mb-2 text-sm font-semibold uppercase tracking-wider text-textMuted">
        Collections
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingRight: 16 }}
      >
        {collections.map((col) => (
          <CollectionChip
            key={col.id}
            emoji={col.emoji}
            title={col.title}
            onPress={() => router.push(`/collections/${col.id}`)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
