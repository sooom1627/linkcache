import { Pressable, Text, View } from "react-native";

import { ArrowRightLeft } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import type { DashboardTableViewMode } from "@/src/features/links/types/dashboard.types";
import { colors } from "@/src/shared/constants/colors";

export function DashboardBreakdownToggleControls(props: {
  tableView: DashboardTableViewMode;
  onTableViewChange: (v: DashboardTableViewMode) => void;
}) {
  const { tableView, onTableViewChange } = props;
  const { t } = useTranslation();

  const toggleTableView = () => {
    onTableViewChange(tableView === "collection" ? "domain" : "collection");
  };

  const currentTableViewLabel =
    tableView === "collection"
      ? t("links.dashboard.table_view_collection")
      : t("links.dashboard.table_view_domain");

  return (
    <View className="flex-row items-center gap-2">
      <Pressable
        onPress={toggleTableView}
        className="w-[102px] flex-row items-center justify-between rounded-full border border-slate-200 bg-white px-2.5 py-1.5"
        hitSlop={8}
      >
        <View className="flex-1 items-center justify-center pr-1">
          <Text
            className="text-[11px] font-semibold text-slate-700"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {currentTableViewLabel}
          </Text>
        </View>
        <ArrowRightLeft size={12} color={colors.icon} className="shrink-0" />
      </Pressable>
    </View>
  );
}
