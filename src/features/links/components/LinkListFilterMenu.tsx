import { useCallback } from "react";

import { Pressable, Text, View } from "react-native";

import { SlidersHorizontal } from "lucide-react-native";

import { colors } from "@/src/shared/constants/colors";
import { useBottomSheetModal } from "@/src/shared/hooks/useBottomSheetModal";

import { useLinkListFilterContext } from "../contexts/LinkListFilterContext";

import { LinkListFilterModal } from "./LinkListFilterModal";

/**
 * リンク一覧のフィルターメニューボタン
 *
 * フィルターアイコンを表示し、タップでフィルターモーダルを開きます。
 * フィルターがアクティブな場合は、背景色とバッジで視覚的に表現します。
 */
export function LinkListFilterMenu({ isDisabled }: { isDisabled: boolean }) {
  const { ref, present, dismiss } = useBottomSheetModal();
  const { hasActiveFilters, activeFilterCount } = useLinkListFilterContext();

  const handlePress = useCallback(() => {
    present();
  }, [present]);

  return (
    <>
      <Pressable
        onPress={handlePress}
        className={`flex-row items-center gap-2 rounded-full px-3 py-1.5 ${
          hasActiveFilters
            ? "bg-mainHover active:bg-main"
            : "bg-surfaceMuted active:bg-slate-200"
        }`}
        accessibilityRole="button"
        accessibilityLabel={`Open filter menu${hasActiveFilters ? `, ${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} active` : ""}`}
        accessibilityHint="Tap to filter links by status or read status"
        hitSlop={8}
        disabled={isDisabled}
        style={{ opacity: isDisabled ? 0.5 : 1 }}
      >
        <SlidersHorizontal
          size={14}
          color={
            isDisabled
              ? colors.iconMuted
              : hasActiveFilters
                ? colors.textOnDark
                : colors.textSecondary
          }
          strokeWidth={2.5}
        />
        <Text
          className={`text-sm font-medium ${hasActiveFilters ? "text-white" : "text-slate-600"}`}
        >
          Filter
        </Text>
        {hasActiveFilters && (
          <View className="min-w-[18px] items-center justify-center rounded-full bg-white px-1.5 py-0.5">
            <Text className="text-xs font-semibold text-slate-700">
              {activeFilterCount}
            </Text>
          </View>
        )}
      </Pressable>
      <LinkListFilterModal ref={ref} onClose={dismiss} />
    </>
  );
}
