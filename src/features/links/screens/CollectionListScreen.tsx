import { Pressable, Text, View } from "react-native";

import * as Haptics from "expo-haptics";

import { FolderOpen, Plus } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { CollectionCard } from "@/src/features/links/components/CollectionCard";
import { useCollections } from "@/src/features/links/hooks/useCollections";
import { CollectionCreateModal } from "@/src/features/links/screens/CollectionCreateModal";
import { colors } from "@/src/shared/constants/colors";
import { useBottomSheetModal } from "@/src/shared/hooks/useBottomSheetModal";

const CARD_STYLE = { borderCurve: "continuous" as const };

/** モック: Un Collectioned のリンク数 */
const MOCK_UN_COLLECTIONED_COUNT = 8;

/**
 * コレクション一覧画面（UIのみ）
 *
 * 全コレクション一覧。「すべて表示」の遷移先。
 * Un Collectioned + 各コレクションを表示。モックデータ使用。
 * Link で prefetch・iOS プレビュー対応。API・hooks は後で実装予定。
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

  const { collections } = useCollections();
  const isEmpty = collections.length === 0;

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

        {isEmpty ? (
          <View className="mt-12 items-center px-8">
            <View className="mb-6 rounded-full bg-slate-50 p-6">
              <FolderOpen size={48} color={colors.iconMuted} strokeWidth={1} />
            </View>
            <Text className="mb-2 text-center text-lg font-semibold text-slate-800">
              {t("links.collection_list.empty_title")}
            </Text>
            <Text className="mb-8 text-center text-sm leading-5 text-slate-500">
              {t("links.collection_list.empty_description")}
            </Text>
            <Pressable
              onPress={handleNewCollectionPress}
              className="flex-row items-center gap-2 rounded-full bg-mainDark px-6 py-3 shadow-sm active:bg-mainHover"
              accessibilityRole="button"
              accessibilityLabel={t("links.overview.new_collection")}
            >
              <Plus size={20} color={colors.accent} strokeWidth={2.5} />
              <Text className="font-semibold text-white">
                {t("links.overview.new_collection")}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="gap-2">
            {Array.from({ length: Math.ceil(collections.length / 2) }).map(
              (_, rowIndex) => {
                const rowItems = collections.slice(
                  rowIndex * 2,
                  rowIndex * 2 + 2,
                );
                if (rowItems.length === 0) return null;
                return (
                  <View key={rowIndex} className="flex-row gap-2">
                    {rowItems.map((col) => (
                      <View key={col.id} className="min-h-28 min-w-0 flex-1">
                        <CollectionCard
                          emoji={col.emoji ?? undefined}
                          title={col.name}
                          itemsCount={col.itemsCount}
                          href={`/collections/${col.id}`}
                        />
                      </View>
                    ))}
                  </View>
                );
              },
            )}
            {/* New Collection: 細い1列ライン */}
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
