import { Pressable, Text, View } from "react-native";

import { Link, type Href } from "expo-router";

import { ChevronRight } from "lucide-react-native";

import { colors } from "@/src/shared/constants/colors";

export interface CollectionCardProps {
  /** 絵文字（1文字）。CollectionChip と同様 */
  emoji?: string;
  /** 表示テキスト */
  title: string;
  /** リンク数 */
  itemsCount: number;
  /** 遷移先URL。指定時は Link でナビゲーション（prefetch 有効） */
  href?: Href;
  /** タップ時のコールバック。href 未指定時のみ使用 */
  onPress?: () => void;
}

const CARD_STYLE = { borderCurve: "continuous" as const };

const cardContent = (
  emoji: string | undefined,
  title: string,
  itemsCount: number,
  isInteractive: boolean,
) => (
  <>
    {emoji ? (
      <View className="mb-2 self-start rounded-full bg-slate-50 p-2">
        <Text className="text-xl" selectable={false}>
          {emoji}
        </Text>
      </View>
    ) : null}
    <Text
      className="text-base font-semibold text-slate-900"
      numberOfLines={1}
      selectable
    >
      {title}
    </Text>
    <View className="mt-0.5 flex-row items-center gap-1">
      <Text
        className="text-xs text-slate-500"
        style={{ fontVariant: ["tabular-nums"] }}
        selectable
      >
        {itemsCount} items
      </Text>
      {isInteractive ? (
        <ChevronRight size={14} color={colors.iconMuted} strokeWidth={2} />
      ) : null}
    </View>
  </>
);

/**
 * コレクション表示用カード（グリッド用）
 *
 * CollectionChip と表示要素を統一: emoji + title。
 * href 指定時は Link で prefetch・iOS プレビュー対応。
 */
export function CollectionCard({
  emoji,
  title,
  itemsCount,
  href,
  onPress,
}: CollectionCardProps) {
  const isInteractive = Boolean(href || onPress);

  const content = cardContent(emoji, title, itemsCount, isInteractive);

  if (href) {
    return (
      <Link href={href} asChild>
        <Pressable
          className="max-h-28 min-w-0 flex-1 justify-center rounded-2xl border border-slate-200 bg-white p-3 active:bg-slate-50"
          style={CARD_STYLE}
          accessibilityRole="link"
          accessibilityLabel={`Collection: ${title}, ${itemsCount} items`}
        >
          {content}
        </Pressable>
      </Link>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      className="max-h-28 min-w-0 flex-1 justify-center rounded-2xl border border-slate-200 bg-white p-3 active:bg-slate-50"
      style={CARD_STYLE}
      accessibilityRole="button"
      accessibilityLabel={`Collection: ${title}, ${itemsCount} items`}
    >
      {content}
    </Pressable>
  );
}
