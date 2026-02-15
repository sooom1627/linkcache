import { Pressable, Text, View } from "react-native";

import { useRouter } from "expo-router";

import { ChevronRight, Clock, Link2, Plus } from "lucide-react-native";

import { CollectionCard } from "@/src/features/links/components/CollectionCard";
import { colors } from "@/src/shared/constants/colors";

/** hex を rgba に変換（opacity: 0-1） */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const CARD_STYLE = { borderCurve: "continuous" as const };

/** モック: 統計 */
const MOCK_STATS = { all: 32, new: 12, stock: 8, readSoon: 8, done: 12 };

/** Status 4件（2カラム用）＋ 各ステータス用の色 */
const STATUS_ITEMS = [
  {
    key: "new",
    label: "New",
    statusParam: "new" as const,
    color: colors.statusNew,
  },
  {
    key: "readSoon",
    label: "Read Soon",
    statusParam: "read_soon" as const,
    color: colors.statusReadSoon,
  },
  {
    key: "stock",
    label: "Stock",
    statusParam: "stock" as const,
    color: colors.statusStock,
  },
  {
    key: "done",
    label: "Done",
    statusParam: "done" as const,
    color: colors.statusDone,
  },
] as const;

/** モック: コレクション（最大5件表示、6件目は New Collection カード） */
const MOCK_COLLECTIONS = [
  { emoji: "💼", title: "Work", itemsCount: 24 },
  { emoji: "🎨", title: "Design", itemsCount: 56 },
  { emoji: "🍳", title: "Recipes", itemsCount: 12 },
  { emoji: "💻", title: "Tech", itemsCount: 31 },
  { emoji: "📚", title: "Learning", itemsCount: 18 },
];

/** モック: 要対応リンク */
const MOCK_NEED_ATTENTION = [
  { title: "Optimizing UI for High Latency", daysAgo: 45 },
  { title: "React Native Performance Tips", daysAgo: 12 },
  { title: "Design Systems Best Practices", daysAgo: 7 },
] as const;

const THUMBNAIL_SIZE = 72;
const THUMBNAIL_WIDTH = Math.round(THUMBNAIL_SIZE * 1.91);

/**
 * リンク概要画面（仮UI）
 *
 * 統計カード、コレクショングリッド、要対応リンクリストを表示。
 * モックデータのみ。既存コンポーネントは使用せずインライン実装。
 */
export function LinksOverViewScreen() {
  const router = useRouter();

  const handleStatusPress = (statusParam: string) => {
    const params = statusParam === "all" ? {} : { status: statusParam };
    router.push({ pathname: "/links", params });
  };

  return (
    <View className="h-fit gap-4 pb-24">
      {/* 1. Status（View All + 4件を2カラム） */}
      <View className="gap-2">
        <View className="flex-row items-center justify-between py-0.5">
          <Text className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Status
          </Text>
          <Pressable
            onPress={() => handleStatusPress("all")}
            className="-mr-1 flex-row items-center gap-0.5 py-1.5 pl-2 pr-1 active:opacity-70"
            accessibilityRole="link"
            accessibilityLabel="View all links"
          >
            <Text
              className="text-sm font-medium"
              style={{ color: colors.accent }}
            >
              View All
            </Text>
            <ChevronRight size={14} color={colors.accent} strokeWidth={2.5} />
          </Pressable>
        </View>
        <View className="gap-2">
          {[0, 1].map((rowIndex) => (
            <View key={rowIndex} className="flex-row gap-2">
              {STATUS_ITEMS.slice(rowIndex * 2, rowIndex * 2 + 2).map(
                (item) => (
                  <Pressable
                    key={item.key}
                    onPress={() => handleStatusPress(item.statusParam)}
                    className="flex-1 active:opacity-90"
                    accessibilityRole="button"
                    accessibilityLabel={`${item.label}: ${MOCK_STATS[item.key]} items`}
                  >
                    <View
                      className="overflow-hidden rounded-xl border border-slate-200 p-3 shadow-none"
                      style={[
                        CARD_STYLE,
                        {
                          backgroundColor: hexToRgba(item.color, 0.06),
                          borderLeftWidth: 3,
                          borderLeftColor: item.color,
                        },
                      ]}
                    >
                      <Text className="text-xs font-medium text-slate-500">
                        {item.label}
                      </Text>
                      <Text className="mt-0.5 text-2xl font-bold tabular-nums text-slate-900">
                        {MOCK_STATS[item.key]}
                      </Text>
                    </View>
                  </Pressable>
                ),
              )}
            </View>
          ))}
        </View>
      </View>

      {/* 2. コレクションセクション（仮: 3件 + New Collection、2行） */}
      <View className="gap-2">
        <View className="flex-row items-center justify-between py-0.5">
          <Text className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Collections
          </Text>
          <Pressable
            onPress={() => {}}
            className="-mr-1 flex-row items-center gap-0.5 py-1.5 pl-2 pr-1 active:opacity-70"
            accessibilityRole="link"
            accessibilityLabel="View all collections"
          >
            <Text
              className="text-sm font-medium"
              style={{ color: colors.accent }}
            >
              View All
            </Text>
            <ChevronRight size={14} color={colors.accent} strokeWidth={2.5} />
          </Pressable>
        </View>
        <View className="gap-2">
          {[0, 1].map((rowIndex) => (
            <View key={rowIndex} className="flex-row gap-2">
              <View className="min-h-28 min-w-0 flex-1">
                <CollectionCard
                  emoji={MOCK_COLLECTIONS[rowIndex * 2].emoji}
                  title={MOCK_COLLECTIONS[rowIndex * 2].title}
                  itemsCount={MOCK_COLLECTIONS[rowIndex * 2].itemsCount}
                  onPress={() => {}}
                />
              </View>
              <View className="min-h-28 min-w-0 flex-1">
                {rowIndex === 0 ? (
                  <CollectionCard
                    emoji={MOCK_COLLECTIONS[1].emoji}
                    title={MOCK_COLLECTIONS[1].title}
                    itemsCount={MOCK_COLLECTIONS[1].itemsCount}
                    onPress={() => {}}
                  />
                ) : (
                  <Pressable
                    onPress={() => {}}
                    className="min-h-28 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 active:bg-slate-100"
                    style={CARD_STYLE}
                    accessibilityRole="button"
                    accessibilityLabel="Add new collection"
                  >
                    <Plus size={24} color={colors.iconMuted} strokeWidth={2} />
                    <Text className="mt-2 text-sm font-medium text-slate-600">
                      New Collection
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 3. 要対応セクション */}
      <View className="gap-2">
        <Text className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Forgoten Links
        </Text>
        <View className="gap-1.5">
          {MOCK_NEED_ATTENTION.map((link, index) => (
            <Pressable
              key={index}
              onPress={() => {
                /* TODO: リンク詳細へ遷移 */
              }}
              className="flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-none active:bg-slate-50"
              style={CARD_STYLE}
              accessibilityRole="button"
              accessibilityLabel={`${link.title}, added ${link.daysAgo} days ago, view detail`}
            >
              <View
                className="items-center justify-center overflow-hidden rounded-full bg-slate-50"
                style={{ width: THUMBNAIL_WIDTH, height: THUMBNAIL_SIZE }}
              >
                <Link2
                  size={24}
                  color={colors.iconPlaceholder}
                  strokeWidth={1.5}
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-medium text-slate-800"
                  numberOfLines={2}
                >
                  {link.title}
                </Text>
                <View className="mt-2 flex-row items-center gap-1.5">
                  <Clock size={12} color={colors.iconMuted} strokeWidth={2} />
                  <Text className="text-xs text-slate-500">
                    Added {link.daysAgo} days ago
                  </Text>
                </View>
              </View>
              <ChevronRight
                size={20}
                color={colors.iconMuted}
                strokeWidth={2}
              />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
