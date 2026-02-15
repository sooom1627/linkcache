import { forwardRef, useCallback, useEffect, useState } from "react";

import { Pressable, Text, TextInput, View } from "react-native";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Plus } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import EmojiPicker, { type EmojiType } from "rn-emoji-keyboard";

import { FormButton } from "@/src/shared/components/forms";
import { BaseBottomSheetModal } from "@/src/shared/components/modals";
import ModalHeader from "@/src/shared/components/modals/ModalHeader";
import { colors } from "@/src/shared/constants/colors";

export interface CollectionEditModalProps {
  collectionId: string;
  initialName: string;
  initialEmoji: string;
  onClose?: () => void;
}

/**
 * コレクション編集モーダル（UIレイヤーのみ）
 *
 * 名前と絵文字を編集してコレクションを更新するフォームを表示します。
 * CollectionCreateModal と UI を統一。
 * 現時点ではAPI連携なし。送信時はモーダルを閉じるのみ。
 */
export const CollectionEditModal = forwardRef<
  BottomSheetModal,
  CollectionEditModalProps
>(({ collectionId, initialName, initialEmoji, onClose }, ref) => {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);
  const [emoji, setEmoji] = useState(initialEmoji);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  // モーダル表示時に初期値を反映（別コレクションから開き直した場合など）
  useEffect(() => {
    setName(initialName);
    setEmoji(initialEmoji);
  }, [collectionId, initialName, initialEmoji]);

  const handleClose = useCallback(() => {
    setIsEmojiPickerOpen(false);
    onClose?.();
  }, [onClose]);

  const handleEmojiSelected = useCallback((emojiObject: EmojiType) => {
    setEmoji(emojiObject.emoji);
    setIsEmojiPickerOpen(false);
  }, []);

  const handleSubmit = useCallback(() => {
    // UIレイヤーのみ: 送信処理は未実装。モーダルを閉じる。
    handleClose();
  }, [handleClose]);

  const handleModalChange = useCallback(
    (index: number) => {
      if (index >= 0) {
        setName(initialName);
        setEmoji(initialEmoji);
      }
    },
    [initialName, initialEmoji],
  );

  const isSubmitDisabled = !name.trim();

  return (
    <BaseBottomSheetModal
      ref={ref}
      snapPoints={["50%", "50%"]}
      enablePanDownToClose={true}
      onChange={handleModalChange}
    >
      <View className="min-h-[280px] flex-1 px-6 pb-8">
        <View className="mb-6">
          <ModalHeader
            title={t("links.collection_edit.title")}
            onClose={handleClose}
          />
        </View>

        <View className="gap-6">
          {/* Collection Identity: CollectionCreateModal と同一レイアウト */}
          <View
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4"
            style={{ borderCurve: "continuous" }}
          >
            <View className="flex-row items-center gap-4">
              <Pressable
                onPress={() => setIsEmojiPickerOpen(true)}
                className={`size-12 items-center justify-center overflow-hidden rounded-full active:scale-[0.97] ${
                  emoji
                    ? "bg-slate-100"
                    : "border-2 border-dashed border-slate-300 bg-slate-50"
                }`}
                accessibilityRole="button"
                accessibilityLabel={t("links.collection_edit.emoji_label")}
              >
                {emoji ? (
                  <Text className="text-2xl" selectable={false}>
                    {emoji}
                  </Text>
                ) : (
                  <Plus size={28} color={colors.iconMuted} strokeWidth={2} />
                )}
              </Pressable>

              <View className="min-h-12 flex-1 justify-center">
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder={t("links.collection_edit.name_placeholder")}
                  placeholderTextColor={colors.iconMuted}
                  maxLength={100}
                  autoCapitalize="words"
                  className="h-12 py-2 text-lg font-medium text-slate-900"
                  accessibilityLabel={t("links.collection_edit.name_label")}
                />
              </View>
            </View>
          </View>

          <View className="pt-2">
            <FormButton
              title={t("links.collection_edit.submit")}
              onPress={handleSubmit}
              disabled={isSubmitDisabled}
            />
          </View>
        </View>
      </View>

      <EmojiPicker
        open={isEmojiPickerOpen}
        onClose={() => setIsEmojiPickerOpen(false)}
        onEmojiSelected={handleEmojiSelected}
        enableSearchBar
        categoryPosition="top"
        disableSafeArea
        defaultHeight="55%"
      />
    </BaseBottomSheetModal>
  );
});

CollectionEditModal.displayName = "CollectionEditModal";
