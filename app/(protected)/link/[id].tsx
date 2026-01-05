import { Text, TouchableOpacity, View } from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";

import { useTranslation } from "react-i18next";

import { LinkDetailScreen } from "@/src/features/links/screens";
import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";

export default function LinkDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  // 型ガード: idが存在しない、または配列の場合はエラー画面を表示
  if (!id || Array.isArray(id)) {
    return (
      <ScreenContainer
        scrollable={false}
        noPaddingBottom
        centerContent={true}
        topComponent={false}
        headerTitle="Swipes"
      >
        <View className="flex-1 items-center justify-center bg-slate-50 px-6">
          <Text className="text-center text-base text-red-500">
            {t("links.detail.error")}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 rounded-xl bg-slate-800 px-6 py-3"
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
          >
            <Text className="text-base font-medium text-white">
              {t("common.back")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scrollable={true}
      noPaddingBottom
      centerContent={false}
      topComponent={false}
      headerTitle="Details"
    >
      <LinkDetailScreen linkId={id} />
    </ScreenContainer>
  );
}
