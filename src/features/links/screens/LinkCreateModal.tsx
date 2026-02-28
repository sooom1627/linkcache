import { forwardRef, useCallback, useRef, useState } from "react";

import { ActivityIndicator, Text, View } from "react-native";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";

import { FormButton } from "@/src/shared/components/forms";
import { ScrollableBottomSheetModal } from "@/src/shared/components/modals";
import ModalHeader from "@/src/shared/components/modals/ModalHeader";
import { showToastError, showToastSuccess } from "@/src/shared/utils/toast";

import { CollectionChip } from "../components/CollectionChip";
import LinkPasteContainer from "../components/LinkPasteContainer";
import { useAddLinkToCollection } from "../hooks/useAddLinkToCollection";
import { useCollections } from "../hooks/useCollections";
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

  const { createLinkAsync, isPending, reset: resetCreate } = useCreateLink();
  const { addLinkToCollectionAsync } = useAddLinkToCollection();
  const {
    collections,
    isLoading: isCollectionsLoading,
    isError: isCollectionsError,
  } = useCollections({ orderBy: "items_count" });

  const hasAutoPastedRef = useRef(false);

  const [selectedCollectionIds, setSelectedCollectionIds] = useState<
    Set<string>
  >(() => new Set());

  const toggleCollection = useCallback((id: string) => {
    setSelectedCollectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

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
    setSelectedCollectionIds(new Set());
    hasAutoPastedRef.current = false; // リセット時にフラグもリセット
    onClose?.();
  }, [onClose, reset, resetCreate]);

  const handleSave = useCallback(async () => {
    if (!preview?.url) return;
    try {
      const { link_id } = await createLinkAsync(preview.url);
      const collectionIds = Array.from(selectedCollectionIds);

      showToastSuccess(t("links.create.callback_messages.success_message"));
      handleClose();

      if (collectionIds.length > 0) {
        Promise.allSettled(
          collectionIds.map((collectionId) =>
            addLinkToCollectionAsync({ collectionId, linkId: link_id }),
          ),
        ).then((results) => {
          const hasFailures = results.some((r) => r.status === "rejected");
          if (hasFailures) {
            showToastError(
              t("links.create.callback_messages.collection_add_error_title"),
              t("links.create.callback_messages.collection_add_error_message"),
            );
          }
        });
      }
    } catch {
      showToastError(
        t("links.create.callback_messages.error_title"),
        t("links.create.callback_messages.error_message"),
      );
    }
  }, [
    preview?.url,
    createLinkAsync,
    selectedCollectionIds,
    addLinkToCollectionAsync,
    t,
    handleClose,
  ]);

  // ボタンの無効化条件
  const isSubmitDisabled = !canSave || isPending;

  return (
    <ScrollableBottomSheetModal
      ref={ref}
      snapPoints={["90%", "100%"]}
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

        {/* 保存メニュー */}
        {(status === "preview" || status === "noOgp") && (
          <>
            {/* コレクション選択 */}
            <View className="mt-6">
              <Text className="text-sm font-semibold uppercase tracking-wide text-mainDark">
                {t("links.create.selectCollections")}
              </Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {isCollectionsLoading ? (
                  <ActivityIndicator size="small" color="#6B7280" />
                ) : isCollectionsError ? (
                  <Text className="text-sm text-slate-400">
                    {t("common.error_generic", {
                      defaultValue: "Could not load collections.",
                    })}
                  </Text>
                ) : (
                  collections.map((col) => (
                    <CollectionChip
                      key={col.id}
                      emoji={col.emoji ?? undefined}
                      title={col.name}
                      selected={selectedCollectionIds.has(col.id)}
                      onPress={() => toggleCollection(col.id)}
                    />
                  ))
                )}
              </View>
            </View>
            {/* 保存ボタン */}
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
          </>
        )}
      </View>
    </ScrollableBottomSheetModal>
  );
});

LinkCreateModal.displayName = "LinkCreateModal";
