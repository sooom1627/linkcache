import { Pressable, Text, View } from "react-native";

import { ChevronRight } from "lucide-react-native";

import { colors } from "@/src/shared/constants/colors";

export interface CollectionCardProps {
  /** 絵文字（1文字）。CollectionChip と同様 */
  emoji?: string;
  /** 表示テキスト */
  title: string;
  /** リンク数 */
  itemsCount: number;
  /** タップ時のコールバック（コレクション詳細へ遷移など） */
  onPress?: () => void;
}

const CARD_STYLE = { borderCurve: "continuous" as const };

/**
 * コレクション表示用カード（グリッド用）
 *
 * CollectionChip と表示要素を統一: emoji + title。
 * Overview 画面の 2x2 グリッドなどで使用。
 */
export function CollectionCard({
  emoji,
  title,
  itemsCount,
  onPress,
}: CollectionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="max-h-28 min-w-0 flex-1 justify-center rounded-2xl border border-slate-200 bg-white p-3 shadow-none active:bg-slate-50"
      style={CARD_STYLE}
      accessibilityRole="button"
      accessibilityLabel={`Collection: ${title}, ${itemsCount} items`}
    >
      {emoji && (
        <View className="mb-2 self-start rounded-full bg-slate-50 p-2">
          <Text className="text-xl" selectable={false}>
            {emoji}
          </Text>
        </View>
      )}
      <Text
        className="text-base font-semibold text-slate-900"
        numberOfLines={1}
      >
        {title}
      </Text>
      <View className="mt-0.5 flex-row items-center gap-1">
        <Text className="text-xs text-slate-500">{itemsCount} items</Text>
        {onPress && (
          <ChevronRight size={14} color={colors.iconMuted} strokeWidth={2} />
        )}
      </View>
    </Pressable>
  );
}
