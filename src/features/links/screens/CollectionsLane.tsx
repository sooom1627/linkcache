import { Pressable, ScrollView, Text, View } from "react-native";

/**
 * ## Collection カード デザイン方針
 *
 * **基本構造**
 * - 左: 絵文字（必ず1文字）をコンテナで囲む
 * - 右: タイトル
 *
 * **デザイン原則**
 * - 絵文字コンテナ: bg-slate-100（ニュートラル）
 * - カード本体: 白背景 + slate-200 ボーダー
 * - ミニマル: 余白を活かし、装飾は最小限
 */

/** 仮データ: 絵文字 + タイトル */
const MOCK_COLLECTIONS = [
  { emoji: "📚", title: "Read Soon" },
  { emoji: "🔬", title: "Tech" },
  { emoji: "🎨", title: "Design" },
  { emoji: "💡", title: "Ideas" },
] as const;

interface CollectionCardProps {
  emoji: string;
  title: string;
}

function CollectionCard({ emoji, title }: CollectionCardProps) {
  return (
    <Pressable
      className="min-w-[150px] flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-3 active:scale-95 active:opacity-90"
      accessibilityRole="button"
      accessibilityLabel={`Collection: ${title}`}
    >
      <View className="items-center justify-center rounded-full bg-surfaceMuted p-3">
        <Text className="text-2xl" selectable={false}>
          {emoji}
        </Text>
      </View>
      <Text
        className="flex-1 text-base font-bold text-mainDark"
        numberOfLines={1}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function CollectionsLane() {
  return (
    <View>
      <Text className="mb-2 text-sm font-semibold uppercase tracking-wider text-textMuted">
        Collections
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingRight: 16 }}
      >
        {MOCK_COLLECTIONS.map((col) => (
          <CollectionCard key={col.title} emoji={col.emoji} title={col.title} />
        ))}
      </ScrollView>
    </View>
  );
}
