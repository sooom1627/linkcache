import { useCallback, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { FlashList } from "@shopify/flash-list";
import { Ellipsis, FolderOpen, Pencil, Trash2 } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import type { ToggleMenuItem } from "@/src/shared/components/ToggleMenu";
import { ToggleMenu } from "@/src/shared/components/ToggleMenu";
import { colors } from "@/src/shared/constants/colors";
import { useBottomSheetModal } from "@/src/shared/hooks/useBottomSheetModal";

import { LinkListCard } from "../components/LinkListCard";
import { LinkListLoadingFooter } from "../components/LinkListLoadingFooter";
import { useCollection } from "../hooks/useCollection";
import { useCollectionLinks } from "../hooks/useCollectionLinks";
import type { UserLink } from "../types/linkList.types";

import { CollectionEditModal } from "./CollectionEditModal";

interface CollectionDetailScreenProps {
  rawId: string | string[] | undefined;
}

function parseCollectionId(
  rawId: string | string[] | undefined,
): string | undefined {
  if (rawId == null) return undefined;
  return Array.isArray(rawId) ? rawId[0] : rawId;
}

/**
 * コレクション詳細画面
 *
 * コレクション内のリンク一覧を FlashList + LinkListCard で表示。
 * CollectionCard / CollectionChip タップ時の遷移先。
 *
 * - useCollection: コレクション詳細（名前、emoji、件数）
 * - useCollectionLinks: コレクション内リンク一覧（fetchUserLinks({ collectionId }) 経由）
 */
export function CollectionDetailScreen({ rawId }: CollectionDetailScreenProps) {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    ref: editModalRef,
    present: presentEditModal,
    dismiss: dismissEditModal,
  } = useBottomSheetModal();

  const collectionId = parseCollectionId(rawId);
  const { collection, isLoading: isCollectionLoading } = useCollection(
    collectionId ?? "",
  );
  const {
    links,
    isLoading: isLinksLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useCollectionLinks(collectionId ?? "");
  const isLoading = isCollectionLoading || isLinksLoading;

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleToggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleEdit = useCallback(() => {
    handleCloseMenu();
    presentEditModal();
  }, [handleCloseMenu, presentEditModal]);

  const handleDelete = useCallback(() => {
    handleCloseMenu();
  }, [handleCloseMenu]);

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
        disabled: true,
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
              <View className="flex size-14 items-center justify-center rounded-full bg-slate-100">
                <Text
                  className="text-2xl font-semibold uppercase"
                  selectable={false}
                >
                  {collection.emoji ?? collection.name?.[0] ?? ""}
                </Text>
              </View>
              <View className="flex-1">
                <Text
                  className="text-xl font-semibold text-slate-900"
                  numberOfLines={1}
                  selectable
                >
                  {collection.name}
                </Text>
                <Text
                  className="mt-0.5 text-sm text-slate-500"
                  style={{ fontVariant: ["tabular-nums"] }}
                  selectable
                >
                  {collection.itemsCount}{" "}
                  {t("links.collection_detail.items_count")}
                </Text>
              </View>
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
            </View>
          </View>
        </View>
      ) : null,
    [collection, t, handleToggleMenu],
  );

  const renderFooter = useCallback(
    () => <LinkListLoadingFooter isLoading={isFetchingNextPage} />,
    [isFetchingNextPage],
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

  if (collectionId == null || collectionId === "") {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-base text-slate-500">
          {t("links.collection_detail.not_found")}
        </Text>
      </View>
    );
  }

  if (!collection && isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  if (!collection) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-base text-slate-500">
          {t("links.collection_detail.not_found")}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlashList
        data={isLinksLoading ? undefined : links}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 120 }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
      />
      {isMenuOpen ? (
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
      <CollectionEditModal
        ref={editModalRef}
        collectionId={collection.id}
        initialName={collection.name}
        initialEmoji={collection.emoji ?? ""}
        onClose={dismissEditModal}
      />
    </View>
  );
}
