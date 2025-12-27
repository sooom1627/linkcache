import { useTranslation } from "react-i18next";

import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";

import LinkCreateForm from "../components/LinkCreateForm";

interface LinkCreateScreenProps {
  onSuccess?: () => void;
}

/**
 * リンク作成画面
 *
 * URL入力フォームを表示し、リンクの追加を行います。
 */
export default function LinkCreateScreen({ onSuccess }: LinkCreateScreenProps) {
  const { t } = useTranslation();

  return (
    <ScreenContainer
      headerTitle={t("links.create.title")}
      scrollable={false}
      centerContent={false}
    >
      <LinkCreateForm onSuccess={onSuccess} />
    </ScreenContainer>
  );
}
