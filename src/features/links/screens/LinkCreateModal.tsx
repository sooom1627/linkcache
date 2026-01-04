import { forwardRef, useCallback, useEffect, useRef } from "react";

import { Alert, View } from "react-native";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";

import { FormButton } from "@/src/shared/components/forms";
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
  // 初期状態をloadingに設定して、モーダルが開いた時点でローディング状態を表示
  const { status, preview, errorMessage, pasteFromClipboard, reset, canSave } =
    useLinkPaste({ initialStatus: "loading" });

  // リンク作成フック
  const {
    createLink,
    isPending,
    isSuccess,
    isError,
    error,
    reset: resetCreate,
  } = useCreateLink();

  const hasAutoPastedRef = useRef(false);

  // モーダルが開いた時に自動的にクリップボードから貼り付け
  const handleModalChange = useCallback(
    (index: number) => {
      // モーダルが開いた時（index >= 0）かつ、まだ自動貼り付けしていない場合
      if (index >= 0 && !hasAutoPastedRef.current) {
        hasAutoPastedRef.current = true;
        // 即座に貼り付けを実行してローディング状態を表示
        // pasteFromClipboardは内部でクリップボードをチェックし、statusをloadingに設定する
        pasteFromClipboard();
      }
      // モーダルが閉じた時（index === -1）
      if (index === -1) {
        hasAutoPastedRef.current = false;
      }
    },
    [pasteFromClipboard],
  );

  // モーダルを閉じる
  const handleClose = useCallback(() => {
    reset();
    resetCreate();
    hasAutoPastedRef.current = false; // リセット時にフラグもリセット
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
      onChange={handleModalChange}
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
            onReset={reset}
          />
        </View>

        {/* 保存ボタン（preview/noOgp状態でのみ表示） */}
        {(status === "preview" || status === "noOgp") && (
          <View className="mt-6">
            <FormButton
              title={
                isPending
                  ? t("links.create.saving")
                  : t("links.create.submit_button")
              }
              onPress={handleSave}
              disabled={isSubmitDisabled}
            />
          </View>
        )}
      </View>
    </ScrollableBottomSheetModal>
  );
});

LinkCreateModal.displayName = "LinkCreateModal";
