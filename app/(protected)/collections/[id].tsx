import { Text, View } from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";

import { useTranslation } from "react-i18next";

import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";

/**
 * コレクション詳細画面（プレースホルダー）
 *
 * CollectionDetailScreen 実装までの仮画面。
 * CollectionCard タップ時の遷移先。
 */
export default function CollectionDetailPlaceholder() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <ScreenContainer
      scrollable={false}
      noPaddingBottom
      centerContent={true}
      topComponent={false}
      headerTitle={t("links.collection_list.title")}
      onBackPress={() => router.back()}
    >
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-base text-slate-500">
          CollectionDetailScreen (id: {id})
        </Text>
        <Text className="mt-2 text-center text-sm text-slate-400">
          TODO: 実装予定
        </Text>
      </View>
    </ScreenContainer>
  );
}
