import { useTranslation } from "react-i18next";

import { LinksOverViewScreen } from "@/src/features/links/screens/LinksOverViewScreen";
import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";

export default function LinkList() {
  const { t } = useTranslation();

  return (
    <ScreenContainer
      scrollable={true}
      centerContent={false}
      noPaddingBottom
      headerTitle={t("links.headerTitle")}
      subtitle={t("links.subtitle")}
    >
      <LinksOverViewScreen />
    </ScreenContainer>
  );
}
