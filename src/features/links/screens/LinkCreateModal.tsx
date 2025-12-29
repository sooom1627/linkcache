import { forwardRef, useCallback, useEffect } from "react";

import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Check } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { ScrollableBottomSheetModal } from "@/src/shared/components/modals";
import ModalHeader from "@/src/shared/components/modals/ModalHeader";

import LinkPasteContainer from "../components/LinkPasteContainer";
import { useCreateLink } from "../hooks/useCreateLink";
import { useLinkPaste } from "../hooks/useLinkPaste";

interface LinkCreateModalProps {
  onClose?: () => void;
}

/**
 * リンク作成モーダル
 *
 * クリップボードからURLを貼り付けてリンクを保存します。
 * 状態に応じてUIが切り替わります：
 * - empty: 貼り付けを促すUI
 * - loading: 読み込み中
 * - preview: OGPプレビュー表示
 * - noOgp: OGP取得失敗（URLのみ表示）
 * - invalid: 無効なURL
 */
export const LinkCreateModal = forwardRef<
  BottomSheetModal,
  LinkCreateModalProps
>(({ onClose }, ref) => {
  const { t } = useTranslation();

  // リンク貼り付けフック
  const {
    status,
    preview,
    errorMessage,
    pasteFromClipboard,
    updateUrl,
    reset,
    canSave,
  } = useLinkPaste();

  // リンク作成フック
  const {
    createLink,
    isPending,
    isSuccess,
    isError,
    error,
    reset: resetCreate,
  } = useCreateLink();

  // モーダルを閉じる
  const handleClose = useCallback(() => {
    reset();
    resetCreate();
    onClose?.();
  }, [onClose, reset, resetCreate]);

  // 保存処理
  const handleSave = useCallback(() => {
    if (!preview?.url) return;
    createLink(preview.url);
  }, [preview, createLink]);

  // 成功時の処理
  useEffect(() => {
    if (isSuccess) {
      Alert.alert(
        t("links.create.callback_messages.success_title"),
        t("links.create.callback_messages.success_message"),
      );
      handleClose();
    }
  }, [isSuccess, t, handleClose]);

  // エラー時の処理
  useEffect(() => {
    if (isError && error) {
      Alert.alert(
        t("links.create.callback_messages.error_title"),
        t("links.create.callback_messages.error_message"),
      );
    }
  }, [isError, error, t]);

  // ボタンの無効化条件
  const isSubmitDisabled = !canSave || isPending;

  return (
    <ScrollableBottomSheetModal
      ref={ref}
      snapPoints={["50%", "70%"]}
      index={0}
      enablePanDownToClose={false}
      stackBehavior="switch"
    >
      <View className="flex-1 px-5 pb-8">
        <ModalHeader title={t("links.create.title")} onClose={handleClose} />

        {/* 状態に応じて切り替わるUI */}
        <View className="mt-2">
          <LinkPasteContainer
            status={status}
            preview={preview}
            errorMessage={errorMessage}
            onPaste={pasteFromClipboard}
            onUpdateUrl={updateUrl}
            onReset={reset}
          />
        </View>

        {/* 保存ボタン（preview/noOgp状態でのみ表示） */}
        {(status === "preview" || status === "noOgp") && (
          <View className="mt-6">
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSubmitDisabled}
              className={`flex-row items-center justify-center gap-2 rounded-xl py-4 ${
                isSubmitDisabled ? "bg-slate-100" : "bg-blue-500"
              }`}
              accessibilityRole="button"
              accessibilityLabel={t("links.create.submit_button")}
              activeOpacity={0.8}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Check
                    size={18}
                    color={isSubmitDisabled ? "#94a3b8" : "#ffffff"}
                    strokeWidth={2}
                  />
                  <Text
                    className={`text-base font-medium ${
                      isSubmitDisabled ? "text-slate-400" : "text-white"
                    }`}
                  >
                    {t("links.create.submit_button")}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollableBottomSheetModal>
  );
});

LinkCreateModal.displayName = "LinkCreateModal";
