import { useTranslation } from "react-i18next";

import { LinkListScreen, useLinks } from "@/src/features/links";
import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";

export default function LinkList() {
  const { t } = useTranslation();
  const { totalCount } = useLinks();

  return (
    <ScreenContainer
      scrollable={false}
      centerContent={false}
      noPaddingBottom
      headerTitle={t("links.header.title")}
      subtitle={t("links.header.subtitle", { count: totalCount })}
    >
      <LinkListScreen />
    </ScreenContainer>
  );
}
