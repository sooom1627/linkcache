import { Filter, Inbox, Plus } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { EmptyState } from "@/src/shared/components/EmptyState";
import { colors } from "@/src/shared/constants/colors";
import { useModal } from "@/src/shared/providers/ModalContext";

interface LinkListEmptyProps {
  /** フィルターが適用されているかどうか */
  hasActiveFilters?: boolean;
  /** フィルターをリセットするコールバック */
  onResetFilters?: () => void;
}

/**
 * リンク一覧の空状態コンポーネント
 *
 * リンクが1件も保存されていない場合、またはフィルター結果が0件の場合に表示
 */
export function LinkListEmpty({
  hasActiveFilters = false,
  onResetFilters,
}: LinkListEmptyProps) {
  const { t } = useTranslation();
  const { openModal } = useModal();

  if (hasActiveFilters) {
    return (
      <EmptyState
        icon={<Filter size={40} color={colors.iconMuted} strokeWidth={1.5} />}
        title={t("links.list.filter_empty_title")}
        description={t("links.list.filter_empty_description")}
        actionLabel={onResetFilters ? t("links.filter.reset") : undefined}
        onAction={onResetFilters}
        ctaVariant="secondary"
        variant="compact"
      />
    );
  }

  return (
    <EmptyState
      icon={<Inbox size={40} color={colors.iconMuted} strokeWidth={1.5} />}
      title={t("links.list.empty_title")}
      description={t("links.list.empty_description")}
      actionLabel={t("links.create.add_button")}
      onAction={() => openModal("linkCreate")}
      actionIcon={<Plus size={20} color={colors.accent} strokeWidth={2.5} />}
      ctaVariant="primary"
      variant="compact"
    />
  );
}
