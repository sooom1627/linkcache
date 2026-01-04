import { useCallback } from "react";

import { Pressable, Text } from "react-native";

import { SlidersHorizontal } from "lucide-react-native";

import { useBottomSheetModal } from "@/src/shared/hooks/useBottomSheetModal";

import { LinkListFilterModal } from "./LinkListFilterModal";

/**
 * リンク一覧のフィルターメニューボタン
 *
 * フィルターアイコンを表示し、タップでフィルターモーダルを開きます。
 */
export function LinkListFilterMenu({ isDisabled }: { isDisabled: boolean }) {
  const { ref, present, dismiss } = useBottomSheetModal();

  const handlePress = useCallback(() => {
    present();
  }, [present]);

  return (
    <>
      <Pressable
        onPress={handlePress}
        className="flex-row items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 active:bg-slate-200"
        accessibilityRole="button"
        accessibilityLabel="Open filter menu"
        accessibilityHint="Tap to filter links by status or read status"
        hitSlop={8}
        disabled={isDisabled}
        style={{ opacity: isDisabled ? 0.5 : 1 }}
      >
        <SlidersHorizontal
          size={14}
          color={isDisabled ? "#94A3B8" : "#475569"}
          strokeWidth={2.5}
        />
        <Text className="text-sm font-medium text-slate-600">Filter</Text>
      </Pressable>
      <LinkListFilterModal ref={ref} onClose={dismiss} />
    </>
  );
}
