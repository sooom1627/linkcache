import { useCallback } from "react";

import { Alert, Text, View } from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";

import { useTranslation } from "react-i18next";

import {
  CollectionDetailScreen,
  mockCollections,
} from "@/src/features/links/screens/CollectionDetailScreen";
import { CollectionEditModal } from "@/src/features/links/screens/CollectionEditModal";
import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";
import { useBottomSheetModal } from "@/src/shared/hooks/useBottomSheetModal";

/**
 * コレクション詳細ルート
 *
 * CollectionCard タップ時の遷移先。
 */
export default function CollectionDetailRoute() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const {
    ref: editModalRef,
    present: presentEditModal,
    dismiss: dismissEditModal,
  } = useBottomSheetModal();

  const handleEdit = useCallback(() => {
    presentEditModal();
  }, [presentEditModal]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      t("links.collection_detail.delete_confirm.title"),
      t("links.collection_detail.delete_confirm.message"),
      [
        {
          text: t("links.collection_detail.delete_confirm.cancel"),
          style: "cancel",
        },
        {
          text: t("links.collection_detail.delete_confirm.confirm"),
          style: "destructive",
          onPress: () => {
            // TODO: コレクション削除 API 実装後に呼び出し
            router.back();
          },
        },
      ],
      { cancelable: true },
    );
  }, [t, router]);

  const rawId = params.id;
  const collectionId =
    typeof rawId === "string"
      ? rawId
      : Array.isArray(rawId)
        ? rawId[0]
        : undefined;
  const collection =
    collectionId != null ? (mockCollections[collectionId] ?? null) : null;
  const headerTitle = collection
    ? `${collection.emoji} ${collection.title}`
    : t("links.collection_list.title");

  if (collectionId == null || collectionId === "") {
    return (
      <ScreenContainer
        scrollable={false}
        noPaddingBottom
        centerContent
        topComponent={false}
        headerTitle={t("links.collection_list.title")}
        onBackPress={() => router.back()}
      >
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base text-slate-500">
            {t("links.collection_detail.not_found")}
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scrollable={false}
      noPaddingBottom
      centerContent={false}
      topComponent={false}
      headerTitle={headerTitle}
      onBackPress={() => router.back()}
    >
      <CollectionDetailScreen
        collectionId={collectionId}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      {collection ? (
        <CollectionEditModal
          ref={editModalRef}
          collectionId={collection.id}
          initialName={collection.title}
          initialEmoji={collection.emoji}
          onClose={dismissEditModal}
        />
      ) : null}
    </ScreenContainer>
  );
}
