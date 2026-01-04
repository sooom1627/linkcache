import { Text, TouchableOpacity, View } from "react-native";

import { Inbox, Plus } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { useModal } from "@/src/shared/providers/ModalContext";

/**
 * リンク一覧の空状態コンポーネント
 *
 * リンクが1件も保存されていない場合に表示
 */
export function LinkListEmpty() {
  const { t } = useTranslation();
  const { openModal } = useModal();

  return (
    <View className="mt-12 items-center px-8">
      <View className="mb-6 rounded-full bg-slate-50 p-6">
        <Inbox size={48} color="#94a3b8" strokeWidth={1} />
      </View>
      <Text className="mb-2 text-center text-lg font-semibold text-slate-800">
        {t("links.list.empty_title")}
      </Text>
      <Text className="mb-8 text-center text-sm leading-5 text-slate-500">
        {t("links.list.empty_description")}
      </Text>

      <TouchableOpacity
        onPress={() => openModal("linkCreate")}
        className="flex-row items-center gap-2 rounded-full bg-slate-900 px-6 py-3 shadow-sm active:bg-slate-700"
        accessibilityRole="button"
        accessibilityLabel={t("links.create.add_button")}
      >
        <Plus size={20} color="white" strokeWidth={2.5} />
        <Text className="font-semibold text-white">
          {t("links.create.add_button")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
