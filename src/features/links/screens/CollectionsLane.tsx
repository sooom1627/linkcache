import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import { useRouter } from "expo-router";

import { useTranslation } from "react-i18next";

import { CollectionChip } from "../components/CollectionChip";
import { useCollections } from "../hooks/useCollections";

export function CollectionsLane() {
  const { t } = useTranslation();
  const router = useRouter();
  const { collections, isLoading, isError } = useCollections({ limit: 5 });

  if (isLoading) {
    return (
      <View className="items-center py-4">
        <ActivityIndicator size="small" color="#6B7280" />
      </View>
    );
  }

  if (isError || collections.length === 0) return null;

  return (
    <View>
      <Text className="mb-2 text-sm font-semibold uppercase tracking-wider text-textMuted">
        {t("links.overview.collections_top", {
          count: collections.length,
        })}
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
    </View>
  );
}
