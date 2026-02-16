import { ScrollView, Text, View } from "react-native";

import { useRouter } from "expo-router";

import { CollectionChip } from "../components/CollectionChip";
import { useCollections } from "../hooks/useCollections";

export function CollectionsLane() {
  const router = useRouter();
  const { collections } = useCollections({ limit: 5 });

  return (
    <View>
      {collections.length > 0 ? (
        <>
          <Text className="mb-2 text-sm font-semibold uppercase tracking-wider text-textMuted">
            {`Collections (Top ${collections.length})`}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingRight: 16 }}
          >
            {collections.map((col) => (
              <CollectionChip
                key={col.id}
                emoji={col.emoji ?? undefined}
                title={col.name}
                onPress={() => router.push(`/collections/${col.id}`)}
              />
            ))}
          </ScrollView>
        </>
      ) : null}
    </View>
  );
}
