import { forwardRef, useCallback, useEffect, useState } from "react";

import { Pressable, Text, TextInput, View } from "react-native";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Plus, X } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import EmojiPicker, { type EmojiType } from "rn-emoji-keyboard";

import { FormButton } from "@/src/shared/components/forms";
import { BaseBottomSheetModal } from "@/src/shared/components/modals";
import ModalHeader from "@/src/shared/components/modals/ModalHeader";
import { colors } from "@/src/shared/constants/colors";

import { useCreateCollection } from "../hooks/useCreateCollection";
import { createCollectionSchema } from "../types/collections.types";

const NAME_MAX_LENGTH = 100;

export interface CollectionCreateModalProps {
  onClose?: () => void;
}

/**
 * コレクション作成モーダル
 *
 * 名前と絵文字を入力してコレクションを作成します。
 * 成功時にモーダルを閉じ、コレクション一覧のキャッシュを無効化します。
 */
export const CollectionCreateModal = forwardRef<
  BottomSheetModal,
  CollectionCreateModalProps
>(({ onClose }, ref) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const { createCollection, isPending, isSuccess, isError, reset } =
    useCreateCollection();

  const handleClose = useCallback(() => {
    setName("");
    setEmoji("");
    setIsEmojiPickerOpen(false);
    setNameError(null);
    reset();
    onClose?.();
  }, [onClose, reset]);

  const handleEmojiSelected = useCallback((emojiObject: EmojiType) => {
    setEmoji(emojiObject.emoji);
    setIsEmojiPickerOpen(false);
  }, []);

  const handleClearForm = useCallback(() => {
    setName("");
    setEmoji("");
    setNameError(null);
  }, []);

  const handleNameChange = useCallback(
    (text: string) => {
      setName(text);
      if (text.length > NAME_MAX_LENGTH) {
        setNameError(t("links.collection_create.validation_name_max"));
      } else {
        setNameError(null);
      }
    },
    [t],
  );

  const handleSubmit = useCallback(() => {
    const trimmedName = name.trim();
    const params = {
      name: trimmedName,
      emoji: emoji || undefined,
    };
    const result = createCollectionSchema.safeParse(params);
    if (!result.success) {
      const isNameTooLong =
        trimmedName.length > NAME_MAX_LENGTH ||
        result.error.issues.some(
          (i) => i.path[0] === "name" && i.code === "too_big",
        );
      setNameError(
        isNameTooLong
          ? t("links.collection_create.validation_name_max")
          : (result.error.issues[0]?.message ??
              t("links.collection_create.error_message")),
      );
      return;
    }
    setNameError(null);
    createCollection(result.data);
  }, [createCollection, name, emoji, t]);

  useEffect(() => {
    if (isSuccess) {
      handleClose();
    }
  }, [isSuccess, handleClose]);

  useEffect(() => {
    if (isError) {
      setNameError(t("links.collection_create.error_message"));
    }
  }, [isError, t]);

  const isSubmitDisabled =
    !name.trim() || name.trim().length > NAME_MAX_LENGTH || isPending;

  return (
    <BaseBottomSheetModal
      ref={ref}
      snapPoints={["50%", "50%"]}
      enablePanDownToClose={true}
      onDismiss={handleClose}
    >
      <View className="min-h-[280px] flex-1 px-6 pb-8">
        <View className="mb-6">
          <ModalHeader
            title={t("links.collection_create.title")}
            onClose={handleClose}
          />
        </View>

        <View className="gap-6">
          {/* Collection Identity: カード風の統一入力エリア */}
          <View
            className={`overflow-hidden rounded-2xl border bg-white p-4 ${
              nameError ? "border-red-500" : "border-slate-200"
            }`}
            style={{ borderCurve: "continuous" }}
          >
            <View className="gap-1">
              <View className="flex-row items-center gap-4">
                {/* Emoji: アバター風（タップでピッカー） */}
                <Pressable
                  onPress={() => setIsEmojiPickerOpen(true)}
                  className={`size-12 shrink-0 items-center justify-center overflow-hidden rounded-full active:scale-[0.97] ${
                    emoji
                      ? "bg-slate-100"
                      : "border-2 border-dashed border-slate-300 bg-slate-50"
                  }`}
                  accessibilityRole="button"
                  accessibilityLabel={t("links.collection_create.emoji_label")}
                >
                  {emoji ? (
                    <Text className="text-2xl" selectable={false}>
                      {emoji}
                    </Text>
                  ) : (
                    <Plus size={28} color={colors.iconMuted} strokeWidth={2} />
                  )}
                </Pressable>

                {/* Name: インライン入力 */}
                <View className="min-h-12 flex-1 justify-center">
                  <TextInput
                    value={name}
                    onChangeText={handleNameChange}
                    placeholder={t("links.collection_create.name_placeholder")}
                    placeholderTextColor={colors.iconMuted}
                    autoCapitalize="words"
                    className="h-12 py-2 text-lg font-medium text-slate-900"
                    accessibilityLabel={t("links.collection_create.name_label")}
                  />
                </View>

                {/* クリアボタン */}
                {name.trim() || emoji ? (
                  <Pressable
                    onPress={handleClearForm}
                    className="size-7 shrink-0 items-center justify-center rounded-full active:scale-[0.95]"
                    accessibilityRole="button"
                    accessibilityLabel={t("links.collection_create.clear_form")}
                  >
                    <X size={14} color={colors.iconMuted} strokeWidth={2} />
                  </Pressable>
                ) : null}
              </View>
              {nameError ? (
                <Text className="text-sm text-red-600">{nameError}</Text>
              ) : null}
            </View>
          </View>

          <View className="pt-2">
            <FormButton
              title={t("links.collection_create.submit")}
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

CollectionCreateModal.displayName = "CollectionCreateModal";
