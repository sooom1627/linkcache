import { Text, TouchableOpacity, View } from "react-native";

import { Filter, Inbox, Plus } from "lucide-react-native";
import { useTranslation } from "react-i18next";

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

  // フィルター適用時の空状態
  if (hasActiveFilters) {
    return (
      <View className="mt-12 items-center px-8">
        <View className="mb-6 rounded-full bg-slate-50 p-6">
          <Filter size={48} color={colors.iconMuted} strokeWidth={1} />
        </View>
        <Text className="mb-2 text-center text-lg font-semibold text-slate-800">
          {t("links.list.filter_empty_title")}
        </Text>
        <Text className="mb-8 text-center text-sm leading-5 text-slate-500">
          {t("links.list.filter_empty_description")}
        </Text>

        {onResetFilters && (
          <TouchableOpacity
            onPress={onResetFilters}
            className="flex-row items-center gap-2 rounded-full bg-mainDark px-6 py-3 shadow-sm active:bg-mainHover"
            accessibilityRole="button"
            accessibilityLabel={t("links.filter.reset")}
          >
            <Text className="font-semibold text-white">
              {t("links.filter.reset")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // 通常の空状態
  return (
    <View className="mt-12 items-center px-8">
      <View className="mb-6 rounded-full bg-slate-50 p-6">
        <Inbox size={48} color={colors.iconMuted} strokeWidth={1} />
      </View>
      <Text className="mb-2 text-center text-lg font-semibold text-slate-800">
        {t("links.list.empty_title")}
      </Text>
      <Text className="mb-8 text-center text-sm leading-5 text-slate-500">
        {t("links.list.empty_description")}
      </Text>

      <TouchableOpacity
        onPress={() => openModal("linkCreate")}
        className="flex-row items-center gap-2 rounded-full bg-mainDark px-6 py-3 shadow-sm active:bg-mainHover"
        accessibilityRole="button"
        accessibilityLabel={t("links.create.add_button")}
      >
        <Plus size={20} color={colors.accent} strokeWidth={2.5} />
        <Text className="font-semibold text-white">
          {t("links.create.add_button")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
