import { useCallback, useMemo, useState } from "react";

import { Pressable, Text, TouchableOpacity, View } from "react-native";

import { FlashList } from "@shopify/flash-list";
import { Ellipsis, FolderOpen, Pencil, Trash2 } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import type { ToggleMenuItem } from "@/src/shared/components/ToggleMenu";
import { ToggleMenu } from "@/src/shared/components/ToggleMenu";
import { colors } from "@/src/shared/constants/colors";

import { LinkListCard } from "../components/LinkListCard";
import type { UserLink } from "../types/linkList.types";

/** モック: コレクション情報（CollectionListScreen と整合）。ルートのヘッダー表示用にエクスポート */
export const mockCollections: Record<
  string,
  { id: string; emoji: string; title: string; itemsCount: number }
> = {
  "1": { id: "1", emoji: "💼", title: "Work", itemsCount: 24 },
  "2": { id: "2", emoji: "🎨", title: "Design", itemsCount: 56 },
  "3": { id: "3", emoji: "🍳", title: "Recipes", itemsCount: 12 },
  "4": { id: "4", emoji: "💻", title: "Tech", itemsCount: 31 },
  "5": { id: "5", emoji: "📚", title: "Learning", itemsCount: 18 },
};

/** モック: コレクション別リンク（API未実装のため） */
const MOCK_COLLECTION_LINKS: Record<string, UserLink[]> = {
  "1": [
    {
      status_id: "ls-1",
      user_id: "u-1",
      status: "read_soon",
      triaged_at: "2024-01-15T10:00:00Z",
      read_at: null,
      link_id: "l-1",
      url: "https://example.com/react-performance",
      title: "Optimizing React Native Performance",
      image_url: null,
      favicon_url: null,
      site_name: "example.com",
      link_created_at: "2024-01-10T09:00:00Z",
    },
    {
      status_id: "ls-2",
      user_id: "u-1",
      status: "done",
      triaged_at: "2024-01-12T14:00:00Z",
      read_at: "2024-01-14T16:00:00Z",
      link_id: "l-2",
      url: "https://example.com/design-systems",
      title: "Design Systems Best Practices",
      image_url: null,
      favicon_url: null,
      site_name: "example.com",
      link_created_at: "2024-01-08T11:00:00Z",
    },
  ],
  "2": [],
  "3": [],
  "4": [
    {
      status_id: "ls-3",
      user_id: "u-1",
      status: "new",
      triaged_at: null,
      read_at: null,
      link_id: "l-3",
      url: "https://example.com/expo-router",
      title: "Expo Router Deep Dive",
      image_url: null,
      favicon_url: null,
      site_name: "example.com",
      link_created_at: "2024-01-20T08:00:00Z",
    },
  ],
  "5": [],
};

interface CollectionDetailScreenProps {
  collectionId: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * コレクション詳細画面
 *
 * コレクション内のリンク一覧を表示。
 * CollectionCard / CollectionChip タップ時の遷移先。
 * 現状はモックデータ使用。
 */
export function CollectionDetailScreen({
  collectionId,
  onEdit,
  onDelete,
}: CollectionDetailScreenProps) {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const collection = mockCollections[collectionId] ?? null;
  const links = MOCK_COLLECTION_LINKS[collectionId] ?? [];

  const handleToggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleEdit = useCallback(() => {
    onEdit?.();
    handleCloseMenu();
  }, [onEdit, handleCloseMenu]);

  const handleDelete = useCallback(() => {
    onDelete?.();
    handleCloseMenu();
  }, [onDelete, handleCloseMenu]);

  const menuItems: ToggleMenuItem[] = useMemo(
    () => [
      {
        id: "edit",
        icon: <Pencil size={20} color={colors.icon} strokeWidth={2.5} />,
        label: t("links.collection_detail.header_edit"),
        onPress: handleEdit,
        disabled: !isMenuOpen,
      },
      {
        id: "delete",
        icon: <Trash2 size={20} color={colors.error} strokeWidth={2.5} />,
        label: t("links.collection_detail.header_delete"),
        onPress: handleDelete,
        disabled: !isMenuOpen,
        color: colors.error,
        className: "min-w-[200px]",
      },
    ],
    [t, handleEdit, handleDelete, isMenuOpen],
  );

  const renderItem = useCallback(
    ({ item }: { item: UserLink }) => (
      <View className="py-1">
        <LinkListCard link={item} />
      </View>
    ),
    [],
  );

  const keyExtractor = useCallback((item: UserLink) => item.status_id, []);

  const renderListHeader = useCallback(
    () =>
      collection ? (
        <View className="mb-4 gap-2">
          <View className="h-16" />
          <View className="relative rounded-2xl bg-white p-4">
            <View className="flex-row items-center gap-3">
              {collection.emoji ? (
                <View className="rounded-full bg-slate-100 p-2.5">
                  <Text className="text-2xl" selectable={false}>
                    {collection.emoji}
                  </Text>
                </View>
              ) : null}
              <View className="flex-1">
                <Text
                  className="text-xl font-semibold text-slate-900"
                  numberOfLines={1}
                  selectable
                >
                  {collection.title}
                </Text>
                <Text
                  className="mt-0.5 text-sm text-slate-500"
                  style={{ fontVariant: ["tabular-nums"] }}
                  selectable
                >
                  {links.length} {t("links.collection_detail.items_count")}
                </Text>
              </View>
              {onEdit != null || onDelete != null ? (
                <View className="relative">
                  <TouchableOpacity
                    onPress={handleToggleMenu}
                    className="rounded-full bg-slate-100 p-2.5"
                    hitSlop={10}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={t(
                      "links.collection_detail.header_more_options",
                    )}
                  >
                    <Ellipsis size={20} color={colors.icon} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      ) : null,
    [collection, links.length, t, onEdit, onDelete, handleToggleMenu],
  );

  const renderEmpty = useCallback(
    () => (
      <View className="items-center px-8 py-12">
        <View className="mb-6 rounded-full bg-slate-50 p-6">
          <FolderOpen size={48} color={colors.iconMuted} strokeWidth={1} />
        </View>
        <Text className="mb-2 text-center text-lg font-semibold text-slate-800">
          {t("links.collection_detail.empty_title")}
        </Text>
        <Text className="text-center text-sm leading-5 text-slate-500">
          {t("links.collection_detail.empty_description")}
        </Text>
      </View>
    ),
    [t],
  );

  // コレクション未検出（不正なID）
  if (!collection) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-center text-base text-slate-500">
          {t("links.collection_detail.not_found")}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlashList
        data={links}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 120 }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      />
      {(onEdit != null || onDelete != null) && isMenuOpen ? (
        <>
          <Pressable
            onPress={handleCloseMenu}
            className="absolute inset-0 z-[9998] bg-transparent"
          />
          <View
            className="absolute right-4 z-[9999]"
            style={{ top: 130 }}
            pointerEvents="box-none"
          >
            <ToggleMenu
              items={menuItems}
              isOpen={isMenuOpen}
              onClose={handleCloseMenu}
              position="top-0 right-0"
              width={200}
              expandOrigin="top-right"
            />
          </View>
        </>
      ) : null}
    </View>
  );
}
