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
        className={`size-16 items-center justify-center rounded-full ${
          hasActiveFilters
            ? "bg-main active:bg-mainDark"
            : "bg-white active:bg-slate-100"
        }`}
        style={[
          { opacity: isDisabled ? 0.5 : 1 },
          {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 3,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Open filter menu${hasActiveFilters ? `, ${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} active` : ""}`}
        accessibilityHint="Tap to filter links by status or read status"
        hitSlop={8}
        disabled={isDisabled}
      >
        <SlidersHorizontal
          size={22}
          color={
            isDisabled
              ? colors.iconMuted
              : hasActiveFilters
                ? colors.textOnDark
                : colors.textSecondary
          }
          strokeWidth={2}
        />
        {hasActiveFilters && (
          <View className="absolute -right-0.5 -top-0.5 min-w-[20px] items-center justify-center rounded-full bg-orange-500 px-1.5 py-0.5">
            <Text className="text-xs font-bold text-white">
              {activeFilterCount}
            </Text>
          </View>
        )}
      </Pressable>
      <LinkListFilterModal ref={ref} onClose={dismiss} />
    </>
  );
}
