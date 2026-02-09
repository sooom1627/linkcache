import { useTranslation } from "react-i18next";

import { LinkListScreen, useLinkCount } from "@/src/features/links";
import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";

export default function LinkList() {
  const { t } = useTranslation();
  const { data: totalCountData } = useLinkCount();
  const totalCount = totalCountData?.count ?? 0;

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
