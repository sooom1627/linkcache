import { Pressable, Text, View } from "react-native";

import { Link, type Href } from "expo-router";

import { ArrowRight } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { colors } from "@/src/shared/constants/colors";

interface LinkListViewAllFooterProps {
  viewAllHref: Href;
}

/** リンクリスト下部の View All ボタン */
export function LinkListViewAllFooter({
  viewAllHref,
}: LinkListViewAllFooterProps) {
  const { t } = useTranslation();

  return (
    <View className="items-center pb-14 pt-6">
      <View className="mb-4 h-px w-12 bg-slate-200" />
      <Link href={viewAllHref} asChild>
        <Pressable className="flex-row items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 active:bg-slate-100">
          <Text className="text-sm font-medium text-slate-700">
            {t("links.dashboard.view_all")}
          </Text>
          <ArrowRight size={14} color={colors.icon} strokeWidth={2} />
        </Pressable>
      </Link>
    </View>
  );
}
