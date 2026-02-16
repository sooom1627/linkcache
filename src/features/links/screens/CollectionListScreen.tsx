import { Text, View } from "react-native";

import { FolderOpen } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { colors } from "@/src/shared/constants/colors";

/**
 * コレクション一覧画面
 *
 * コレクション機能は現在開発中です。
 * API連携が実装されるまで、空の状態を表示します。
 */
export function CollectionListScreen() {
  const { t } = useTranslation();

  return (
    <View className="h-fit gap-6 pb-36">
      <View className="gap-2">
        <Text className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          {t("links.overview.collections_section")}
        </Text>
      </View>

      <View className="mt-12 items-center px-8">
        <View className="mb-6 rounded-full bg-slate-50 p-6">
          <FolderOpen size={48} color={colors.iconMuted} strokeWidth={1} />
        </View>
        <Text className="mb-2 text-center text-lg font-semibold text-slate-800">
          {t("links.collection_list.coming_soon")}
        </Text>
        <Text className="text-center text-sm leading-5 text-slate-500">
          {t("links.collection_list.coming_soon_description")}
        </Text>
      </View>
    </View>
  );
}
