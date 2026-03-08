import { Pressable, Text, View } from "react-native";

import { useRouter } from "expo-router";

import {
  Archive,
  ChevronRight,
  CircleCheck,
  Clock,
  Inbox,
  Link2,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { CollectionListItem } from "@/src/features/links/components/CollectionListItem";
import { CollectionListSkeleton } from "@/src/features/links/components/CollectionListSkeleton";
import { useCollections } from "@/src/features/links/hooks/useCollections";
import { useUncollectedLinksCount } from "@/src/features/links/hooks/useUncollectedLinksCount";
import { colors } from "@/src/shared/constants/colors";

/** モック: 統計 */
const MOCK_STATS = { all: 32, new: 12, stock: 8, readSoon: 8, done: 12 };

/** Status 4件 ＋ 各ステータス用の色・アイコン */
const STATUS_ITEMS = [
  {
    key: "new",
    statusParam: "new" as const,
    color: colors.statusNew,
    Icon: Inbox,
  },
  {
    key: "readSoon",
    statusParam: "read_soon" as const,
    color: colors.statusReadSoon,
    Icon: Clock,
  },
  {
    key: "stock",
    statusParam: "stock" as const,
    color: colors.statusStock,
    Icon: Archive,
  },
  {
    key: "done",
    statusParam: "done" as const,
    color: colors.statusDone,
    Icon: CircleCheck,
  },
] as const;

/** モック: 要対応リンク */
const MOCK_NEED_ATTENTION = [
  { title: "Optimizing UI for High Latency", daysAgo: 45 },
  { title: "React Native Performance Tips", daysAgo: 12 },
  { title: "Design Systems Best Practices", daysAgo: 7 },
] as const;

const THUMBNAIL_SIZE = 72;
const THUMBNAIL_WIDTH = Math.round(THUMBNAIL_SIZE * 1.91);

/**
 * リンク概要画面
 *
 * ステータス一覧、コレクションリスト、要対応リンクリストを表示。
 * コレクションセクションは CollectionListItem / useCollections / useUncollectedLinksCount を使用。
 * ステータス・要対応セクションは仮のモックデータ。
 */
export function LinksOverViewScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    collections,
    isLoading: isCollectionsLoading,
    isError: isCollectionsError,
  } = useCollections({ orderBy: "items_count", limit: 5 });
  const { count: uncollectedCount } = useUncollectedLinksCount();

  const handleStatusPress = (statusParam: string) => {
    const params = statusParam === "all" ? {} : { status: statusParam };
    router.push({ pathname: "/links", params });
  };

  return (
    <View className="h-fit gap-4 pb-36">
      {/* 1. Status（縦リスト） */}
      <View className="gap-1">
        <Text className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          {t("links.overview.status")}
        </Text>
        <View className="gap-1">
          {STATUS_ITEMS.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => handleStatusPress(item.statusParam)}
              className="flex-row items-center gap-3 rounded-lg border border-slate-100 bg-white p-2.5 active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel={`${t(`links.filter.options.${item.statusParam}`)}: ${MOCK_STATS[item.key]} items`}
            >
              <View
                className="items-center justify-center rounded-lg"
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: `${item.color}18`,
                }}
              >
                <item.Icon size={16} color={item.color} strokeWidth={1.5} />
              </View>
              <View className="min-w-0 flex-1 justify-center">
                <Text
                  className="text-[15px] font-medium tracking-tight text-slate-900"
                  numberOfLines={1}
                >
                  {t(`links.filter.options.${item.statusParam}`)}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <Text
                  className="text-[13px] text-slate-500"
                  style={{ fontVariant: ["tabular-nums"] }}
                >
                  {MOCK_STATS[item.key]}{" "}
                  {t("links.collection_detail.items_count", {
                    defaultValue: "items",
                  })}
                </Text>
                <ChevronRight size={18} color={colors.icon} strokeWidth={2} />
              </View>
            </Pressable>
          ))}
          <Pressable
            onPress={() => handleStatusPress("all")}
            className="flex-row items-center justify-center gap-2 rounded-lg bg-slate-100/50 py-2.5 active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel={t("links.overview.view_all_links")}
          >
            <Text
              className="text-sm font-medium"
              style={{ color: colors.accent }}
            >
              {t("links.overview.view_all")}
            </Text>
            <ChevronRight size={18} color={colors.accent} strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      {/* 2. コレクションセクション */}
      <View className="gap-1">
        <Text className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          {t("links.overview.collections_section")}
        </Text>
        {/* Un Collectioned（常時表示） */}
        <CollectionListItem
          emoji="📂"
          title={t("links.overview.un_collectioned")}
          itemsCount={uncollectedCount}
          href="/links/un-collectioned"
        />
        {isCollectionsLoading ? (
          <CollectionListSkeleton count={5} />
        ) : isCollectionsError ? (
          <View className="items-center py-4">
            <Text className="text-sm text-slate-400">
              {t("common.error_generic", {
                defaultValue: "Could not load collections.",
              })}
            </Text>
          </View>
        ) : (
          collections.map((col) => (
            <CollectionListItem
              key={col.id}
              emoji={col.emoji ?? undefined}
              title={col.name}
              itemsCount={col.itemsCount}
              href={`/collections/${col.id}`}
            />
          ))
        )}
        <Pressable
          onPress={() => router.push("/collections")}
          className="flex-row items-center justify-center gap-2 rounded-lg bg-slate-100/50 py-2.5 active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel={t("links.overview.view_all_collections")}
        >
          <Text
            className="text-sm font-medium"
            style={{ color: colors.accent }}
          >
            {t("links.overview.view_all")}
          </Text>
          <ChevronRight size={18} color={colors.accent} strokeWidth={2} />
        </Pressable>
      </View>

      {/* 3. 要対応セクション */}
      <View className="gap-1">
        <Text className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          {t("links.overview.forgotten_links")}
        </Text>
        <View className="gap-1">
          {MOCK_NEED_ATTENTION.map((link, index) => (
            <Pressable
              key={index}
              onPress={() => {
                /* TODO: リンク詳細へ遷移 */
              }}
              className="flex-row items-center gap-3 rounded-lg border border-slate-100 bg-white p-2.5 active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel={`${link.title}, ${t("links.overview.added_days_ago", { daysAgo: link.daysAgo })}, view detail`}
            >
              <View
                className="items-center justify-center overflow-hidden rounded-lg bg-slate-100"
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
                  className="text-[15px] font-medium tracking-tight text-slate-900"
                  numberOfLines={2}
                >
                  {link.title}
                </Text>
                <View className="mt-2 flex-row items-center gap-1.5">
                  <Clock size={12} color={colors.icon} strokeWidth={2} />
                  <Text className="text-[13px] text-slate-500">
                    {t("links.overview.added_days_ago", {
                      daysAgo: link.daysAgo,
                    })}
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={colors.icon} strokeWidth={2} />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
