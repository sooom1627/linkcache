import { Text, View } from "react-native";

import { useRouter } from "expo-router";

import { useTranslation } from "react-i18next";

import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";

/**
 * コレクション未所属リンク一覧（プレースホルダー）
 *
 * Phase 3 で実装予定。Un Collectioned タップ時の遷移先。
 */
export default function UnCollectionedPlaceholder() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <ScreenContainer
      scrollable={false}
      noPaddingBottom
      centerContent={true}
      topComponent={false}
      headerTitle={t("links.overview.un_collectioned")}
      onBackPress={() => router.back()}
    >
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-base text-slate-500">
          Un Collectioned Links
        </Text>
        <Text className="mt-2 text-center text-sm text-slate-400">
          TODO: Phase 3 で実装予定
        </Text>
      </View>
    </ScreenContainer>
  );
}
