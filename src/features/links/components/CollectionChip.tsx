import { Pressable, Text } from "react-native";

export interface CollectionChipProps {
  /** 絵文字（1文字）。variant="add"の場合は省略可 */
  emoji?: string;
  /** 表示テキスト */
  title: string;
  /** 選択状態（選択可能モード時）。trueで塗りつぶしスタイル */
  selected?: boolean;
  /** スタイル種別。add = 破線ボーダー（「追加」用） */
  variant?: "default" | "add";
  /** タップ時のコールバック。選択トグル or 遷移など呼び出し側で制御 */
  onPress?: () => void;
}

/**
 * コレクション表示用チップ
 *
 * 使用パターン:
 * - 選択可能: selected + onPress でトグル（LinkCreateModal）
 * - 遷移用: onPress でナビゲーション（LinkDetailScreen, CollectionsLane）
 * - 追加用: variant="add" で破線スタイル（LinkDetailScreen）
 */
export function CollectionChip({
  emoji,
  title,
  selected = false,
  variant = "default",
  onPress,
}: CollectionChipProps) {
  const isAdd = variant === "add";

  const containerClassName = [
    "flex-row items-center gap-1.5 rounded-full border px-3 py-2 active:scale-[0.98]",
    selected ? "border-accent bg-accent" : "border-border bg-surfaceMuted",
    isAdd && "border-dashed",
  ]
    .filter(Boolean)
    .join(" ");

  const textClassName = [
    "text-xs font-semibold",
    selected ? "text-white" : isAdd ? "text-textMuted" : "text-mainDark",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Pressable
      onPress={onPress}
      className={containerClassName}
      accessibilityRole="button"
      accessibilityState={selected ? { selected: true } : undefined}
      accessibilityLabel={isAdd ? "Add to collection" : `Collection: ${title}`}
    >
      {!isAdd && emoji && (
        <Text className="text-sm" selectable={false}>
          {emoji}
        </Text>
      )}
      {isAdd && (
        <Text
          className="text-sm font-semibold text-textMuted"
          selectable={false}
        >
          +
        </Text>
      )}
      <Text className={textClassName} numberOfLines={1}>
        {title}
      </Text>
    </Pressable>
  );
}
