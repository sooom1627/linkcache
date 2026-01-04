import { forwardRef, useCallback, useState } from "react";

import { Pressable, Text, View } from "react-native";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";

import { BaseBottomSheetModal } from "@/src/shared/components/modals";
import ModalHeader from "@/src/shared/components/modals/ModalHeader";

import type { TriageStatus } from "../types/linkList.types";

export interface LinkListFilterModalProps {
  onClose?: () => void;
}

/**
 * ステータスフィルターのオプション
 */
type StatusFilterOption = "all" | TriageStatus;

/**
 * 既読状態フィルターのオプション
 */
type ReadStatusFilterOption = "all" | "unread" | "read";

/**
 * フィルター選択状態
 */
interface FilterState {
  status: StatusFilterOption;
  readStatus: ReadStatusFilterOption;
}

/**
 * リンク一覧のフィルターモーダル
 *
 * ステータスと既読状態でフィルタリングするためのUIを提供します。
 */
export const LinkListFilterModal = forwardRef<
  BottomSheetModal,
  LinkListFilterModalProps
>(({ onClose }, ref) => {
  const { t } = useTranslation();
  const [filterState, setFilterState] = useState<FilterState>({
    status: "all",
    readStatus: "all",
  });

  // ステータスフィルターの選択
  const handleStatusSelect = useCallback((status: StatusFilterOption) => {
    setFilterState((prev) => ({ ...prev, status }));
  }, []);

  // 既読状態フィルターの選択
  const handleReadStatusSelect = useCallback(
    (readStatus: ReadStatusFilterOption) => {
      setFilterState((prev) => ({ ...prev, readStatus }));
    },
    [],
  );

  // ステータスオプションのリスト
  const statusOptions: { value: StatusFilterOption; label: string }[] = [
    { value: "all", label: t("links.filter.options.all") },
    { value: "inbox", label: t("links.filter.options.inbox") },
    { value: "keep", label: t("links.filter.options.keep") },
    { value: "archived", label: t("links.filter.options.archived") },
    { value: "dismissed", label: t("links.filter.options.dismissed") },
  ];

  // 既読状態オプションのリスト
  const readStatusOptions: {
    value: ReadStatusFilterOption;
    label: string;
  }[] = [
    { value: "all", label: t("links.filter.options.all") },
    { value: "unread", label: t("links.filter.options.unread") },
    { value: "read", label: t("links.filter.options.read") },
  ];

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  return (
    <BaseBottomSheetModal
      ref={ref}
      snapPoints={["60%", "60%"]}
      enablePanDownToClose={true}
    >
      <View className="min-h-[600px] flex-1 px-6 pb-8">
        {/* Header */}
        <View className="mb-6">
          <ModalHeader title={t("links.filter.title")} onClose={handleClose} />
        </View>

        {/* ステータスフィルターセクション */}
        <View className="mb-8 w-full">
          <Text className="mb-3 ml-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {t("links.filter.status")}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {statusOptions.map((option) => {
              const isSelected = filterState.status === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => handleStatusSelect(option.value)}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${option.label}`}
                  accessibilityState={{ selected: isSelected }}
                  className={`rounded-full px-4 py-2.5 ${
                    isSelected
                      ? "bg-slate-900"
                      : "bg-slate-100 active:bg-slate-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isSelected ? "text-white" : "text-slate-600"
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 既読状態フィルターセクション */}
        <View className="w-full">
          <Text className="mb-3 ml-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {t("links.filter.read_status")}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {readStatusOptions.map((option) => {
              const isSelected = filterState.readStatus === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => handleReadStatusSelect(option.value)}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${option.label}`}
                  accessibilityState={{ selected: isSelected }}
                  className={`rounded-full px-4 py-2.5 ${
                    isSelected
                      ? "bg-slate-900"
                      : "bg-slate-100 active:bg-slate-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isSelected ? "text-white" : "text-slate-600"
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </BaseBottomSheetModal>
  );
});

LinkListFilterModal.displayName = "LinkListFilterModal";
