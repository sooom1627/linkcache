import { forwardRef, useCallback } from "react";

import { View } from "react-native";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";

import { ScrollableBottomSheetModal } from "@/src/shared/components/modals";
import ModalHeader from "@/src/shared/components/modals/ModalHeader";

import LinkCreateForm from "../components/LinkCreateForm";

interface LinkCreateModalProps {
  onClose?: () => void;
}

/**
 * リンク作成モーダル
 *
 * BottomSheetModalでリンク作成フォームを表示します。
 * 成功時に自動的にモーダルを閉じます。
 */
export const LinkCreateModal = forwardRef<
  BottomSheetModal,
  LinkCreateModalProps
>(({ onClose }, ref) => {
  const { t } = useTranslation();

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleSuccess = useCallback(() => {
    onClose?.();
  }, [onClose]);

  return (
    <ScrollableBottomSheetModal
      ref={ref}
      snapPoints={["50%", "70%"]}
      index={0}
      enablePanDownToClose={false}
      stackBehavior="switch"
    >
      <View className="flex-1 gap-4 px-4 pb-10">
        <ModalHeader title={t("links.create.title")} onClose={handleClose} />
        <LinkCreateForm onSuccess={handleSuccess} />
      </View>
    </ScrollableBottomSheetModal>
  );
});

LinkCreateModal.displayName = "LinkCreateModal";
