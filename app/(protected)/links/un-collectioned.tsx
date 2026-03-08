import { useRouter } from "expo-router";

import { useTranslation } from "react-i18next";

import { UnCollectionedDetailScreen } from "@/src/features/links/screens/UnCollectionedDetailScreen";
import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";

/**
 * コレクション未所属リンク一覧ルート
 */
export default function UnCollectionedRoute() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <ScreenContainer
      scrollable={false}
      noPaddingBottom
      centerContent={false}
      topComponent={false}
      headerTitle={t("links.overview.un_collectioned")}
      onBackPress={() => router.back()}
    >
      <UnCollectionedDetailScreen />
    </ScreenContainer>
  );
}
