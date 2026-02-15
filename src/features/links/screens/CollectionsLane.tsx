import { ScrollView, Text, View } from "react-native";

import { CollectionChip } from "../components/CollectionChip";

/** 仮データ: 絵文字 + タイトル */
const MOCK_COLLECTIONS = [
  { emoji: "📚", title: "Read Soon" },
  { emoji: "🔬", title: "Tech" },
  { emoji: "🎨", title: "Design" },
  { emoji: "💡", title: "Ideas" },
] as const;

export function CollectionsLane() {
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
        {MOCK_COLLECTIONS.map((col) => (
          <CollectionChip
            key={col.title}
            emoji={col.emoji}
            title={col.title}
            onPress={() => {
              /* TODO: コレクション詳細へ遷移 */
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
}
