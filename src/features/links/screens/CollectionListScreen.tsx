import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

import * as Haptics from "expo-haptics";

import { FolderOpen, Plus } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { CollectionCard } from "@/src/features/links/components/CollectionCard";
import { useCollections } from "@/src/features/links/hooks/useCollections";
import { CollectionCreateModal } from "@/src/features/links/screens/CollectionCreateModal";
import { EmptyState } from "@/src/shared/components/EmptyState";
import { colors } from "@/src/shared/constants/colors";
import { useBottomSheetModal } from "@/src/shared/hooks/useBottomSheetModal";

const CARD_STYLE = { borderCurve: "continuous" as const };

/** モック: Un Collectioned のリンク数 */
const MOCK_UN_COLLECTIONED_COUNT = 8;

/**
 * コレクション一覧画面
 *
 * 全コレクション一覧。「すべて表示」の遷移先。
 * Un Collectioned + useCollections() で取得した各コレクションを表示。
 */
export function CollectionListScreen() {
  const { t } = useTranslation();
  const {
    ref: collectionCreateModalRef,
    present: presentCollectionCreateModal,
    dismiss: dismissCollectionCreateModal,
  } = useBottomSheetModal();

  const handleNewCollectionPress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    presentCollectionCreateModal();
  };

  const { collections, isLoading, isError } = useCollections({
    orderBy: "items_count",
  });
  const isEmpty = !isLoading && !isError && collections.length === 0;

  return (
    <View className="h-fit gap-6 pb-36">
      {/* Un Collectioned（固定表示） */}
      <View className="gap-2">
        <Text className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          {t("links.overview.collections_section")}
        </Text>
        <View className="min-h-28 min-w-0">
          <CollectionCard
            emoji="📂"
            title={t("links.overview.un_collectioned")}
            itemsCount={MOCK_UN_COLLECTIONED_COUNT}
            href="/links/un-collectioned"
          />
        </View>
      </View>

      {/* コレクション一覧（2カラムグリッド） */}
      <View className="gap-2">
        <Text className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          {t("links.collection_list.my_collections")}
        </Text>

        {isLoading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#6B7280" />
          </View>
        ) : isError ? (
          <View className="items-center py-12">
            <Text className="text-center text-base text-slate-500">
              {t("common.error_generic", {
                defaultValue: "An error occurred. Please try again.",
              })}
            </Text>
          </View>
        ) : isEmpty ? (
          <View className="mt-12">
            <EmptyState
              icon={
                <FolderOpen
                  size={40}
                  color={colors.iconMuted}
                  strokeWidth={1.5}
                />
              }
              title={t("links.collection_list.empty_title")}
              description={t("links.collection_list.empty_description")}
              actionLabel={t("links.overview.new_collection")}
              onAction={handleNewCollectionPress}
              actionIcon={
                <Plus size={20} color={colors.accent} strokeWidth={2.5} />
              }
              ctaVariant="primary"
              variant="compact"
            />
          </View>
        ) : (
          <View className="gap-2">
            <FlatList
              data={collections}
              numColumns={2}
              scrollEnabled={false}
              keyExtractor={(col) => col.id}
              columnWrapperStyle={{ gap: 8, marginBottom: 8 }}
              renderItem={({ item }) => (
                <View className="min-h-28 min-w-0 flex-1">
                  <CollectionCard
                    emoji={item.emoji ?? undefined}
                    title={item.name}
                    itemsCount={item.itemsCount}
                    href={`/collections/${item.id}`}
                  />
                </View>
              )}
              ListFooterComponent={
                <Pressable
                  onPress={handleNewCollectionPress}
                  className="flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 py-3 active:bg-slate-100"
                  style={CARD_STYLE}
                  accessibilityRole="button"
                  accessibilityLabel={t("links.overview.new_collection")}
                >
                  <Plus size={20} color={colors.iconMuted} strokeWidth={2} />
                  <Text className="text-sm font-medium text-slate-600">
                    {t("links.overview.new_collection")}
                  </Text>
                </Pressable>
              }
            />
          </View>
        )}
      </View>

      <CollectionCreateModal
        ref={collectionCreateModalRef}
        onClose={dismissCollectionCreateModal}
      />
    </View>
  );
}
