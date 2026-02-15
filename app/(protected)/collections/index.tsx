import { useRouter } from "expo-router";

import { useTranslation } from "react-i18next";

import { CollectionListScreen } from "@/src/features/links";
import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";

export default function Collections() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <ScreenContainer
      scrollable={true}
      noPaddingBottom={true}
      centerContent={false}
      topComponent={false}
      headerTitle={t("links.collection_list.title")}
      onBackPress={() => router.back()}
    >
      <CollectionListScreen />
    </ScreenContainer>
  );
}
