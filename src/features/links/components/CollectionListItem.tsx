import { Pressable, Text, View } from "react-native";

import { Link, type Href } from "expo-router";

import { ChevronRight, FolderOpen } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { colors } from "@/src/shared/constants/colors";

export interface CollectionListItemProps {
  /** 絵文字（1文字）。未指定時はフォルダアイコン */
  emoji?: string;
  /** 表示テキスト */
  title: string;
  /** リンク数 */
  itemsCount: number;
  /** 遷移先URL。指定時は Link でナビゲーション */
  href?: Href;
  /** タップ時のコールバック。href 未指定時のみ使用 */
  onPress?: () => void;
}

const ICON_SIZE = 32;

/**
 * コレクション表示用リストアイテム（横長スタイル）
 *
 * 左: アイコン（絵文字 or フォルダ）
 * 中央: タイトル
 * 右: リンク数 + ChevronRight
 */
export function CollectionListItem({
  emoji,
  title,
  itemsCount,
  href,
  onPress,
}: CollectionListItemProps) {
  const { t } = useTranslation();
  const itemsLabel = t("links.collection_detail.items_count", {
    defaultValue: "items",
  });
  const accessibilityLabel = t("links.collection_detail.accessibility_label", {
    title,
    count: itemsCount,
  });

  const pressableContent = (
    <>
      <View
        className="items-center justify-center overflow-hidden rounded-lg bg-slate-100"
        style={{ width: ICON_SIZE, height: ICON_SIZE }}
      >
        {emoji ? (
          <Text className="text-lg" selectable={false}>
            {emoji}
          </Text>
        ) : (
          <FolderOpen size={16} color={colors.icon} strokeWidth={1.5} />
        )}
      </View>
      <View className="min-w-0 flex-1 justify-center">
        <Text
          className="text-[15px] font-medium tracking-tight text-slate-900"
          numberOfLines={1}
          selectable
        >
          {title}
        </Text>
      </View>
      <View className="flex-row items-center gap-1.5">
        <Text
          className="text-[13px] text-slate-500"
          style={{ fontVariant: ["tabular-nums"] }}
          selectable
        >
          {itemsCount} {itemsLabel}
        </Text>
        <ChevronRight size={18} color={colors.icon} strokeWidth={2} />
      </View>
    </>
  );

  const pressableClassName =
    "flex-row items-center gap-3 rounded-lg border border-slate-100 bg-white p-2.5 active:opacity-80";

  if (href) {
    return (
      <Link href={href} asChild>
        <Pressable
          className={pressableClassName}
          accessibilityRole="link"
          accessibilityLabel={accessibilityLabel}
        >
          {pressableContent}
        </Pressable>
      </Link>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      className={pressableClassName}
      accessibilityRole="button"
      accessibilityLabel={`Collection: ${title}, ${itemsCount} items`}
    >
      {pressableContent}
    </Pressable>
  );
}
