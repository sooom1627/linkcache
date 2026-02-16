import { Text, View } from "react-native";

import { FolderOpen } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { colors } from "@/src/shared/constants/colors";

export function CollectionsLane() {
  const { t } = useTranslation();

  return (
    <View>
      <Text className="mb-2 text-sm font-semibold uppercase tracking-wider text-textMuted">
        {t("links.overview.collections_section")}
      </Text>
      <View className="items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6">
        <FolderOpen size={24} color={colors.iconMuted} strokeWidth={1.5} />
        <Text className="mt-2 text-center text-sm text-slate-400">
          {t("links.collection_list.coming_soon")}
        </Text>
      </View>
    </View>
  );
}
