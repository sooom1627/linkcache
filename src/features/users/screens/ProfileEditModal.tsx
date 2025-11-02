import { forwardRef, useCallback, useEffect, useMemo, useRef } from "react";

import { Alert, View, type TextInput } from "react-native";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { AtSign, UserRound } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { FormButton, FormInput } from "@/src/shared/components/forms";
import { ScrollableBottomSheetModal } from "@/src/shared/components/modals";
import ModalHeader from "@/src/shared/components/modals/ModalHeader";

import { useCheckUserId, useProfile } from "../hooks";
import { useProfileForm } from "../hooks/useProfileForm";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { getUserIdHelperText, isSubmitEnabled } from "../utils";

interface ProfileEditModalProps {
  onClose?: () => void;
}

export const ProfileEditModal = forwardRef<
  BottomSheetModal,
  ProfileEditModalProps
>(({ onClose }, ref) => {
  const { data: profile } = useProfile();
  const { t } = useTranslation();

  // フォーム状態管理
  const { formData, errors, setUserId, setUsername, validateForm } =
    useProfileForm();

  // 元のuser_idを保持（除外用）
  const originalUserId = useMemo(() => profile?.user_id, [profile?.user_id]);

  // user_id重複チェック（現在のuser_idは除外）
  const shouldCheckUserId = formData.user_id !== originalUserId;
  const {
    data: isUserIdAvailable,
    isLoading: isCheckingUserId,
    error: checkError,
  } = useCheckUserId(
    formData.user_id,
    shouldCheckUserId && formData.user_id.length >= 4,
    originalUserId,
  );

  // API処理
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile({
    onSuccess: () => {
      onClose?.();
    },
  });

  // フォーム入力のref
  const usernameInputRef = useRef<TextInput>(null);

  // プロフィールデータをフォームに反映
  useEffect(() => {
    if (profile) {
      setUserId(profile.user_id);
      setUsername(profile.username);
    }
  }, [profile, setUserId, setUsername]);

  // user_idのヘルパーテキスト
  const userIdHelper = getUserIdHelperText(
    t,
    formData.user_id,
    isCheckingUserId,
    checkError,
    isUserIdAvailable,
    originalUserId,
  );

  // 送信ボタン有効化判定
  const submitEnabled = isSubmitEnabled(
    isPending,
    isUserIdAvailable,
    formData.user_id,
    formData.username,
    errors,
    shouldCheckUserId,
  );

  const isUnchanged = useMemo(() => {
    return (
      profile?.user_id === formData.user_id &&
      profile?.username === formData.username
    );
  }, [profile, formData]);

  const handleUpdateProfile = useCallback(async () => {
    // バリデーションチェック（awaitの前に実行）
    if (!validateForm()) return;

    // user_idが利用不可の場合は送信不可（awaitの前に実行）
    if (shouldCheckUserId && isUserIdAvailable === false) return;

    try {
      await updateProfile(
        { user_id: formData.user_id, username: formData.username },
        {
          onSuccess: () => {
            Alert.alert(
              t(
                "users.setting_modal.profile_edit.callback_messages.success_title",
              ),
              t(
                "users.setting_modal.profile_edit.callback_messages.success_message",
              ),
            );
          },
          onError: () => {
            Alert.alert(
              t(
                "users.setting_modal.profile_edit.callback_messages.error_title",
              ),
              t(
                "users.setting_modal.profile_edit.callback_messages.error_message",
              ),
            );
          },
        },
      );
    } finally {
      setUserId(profile?.user_id ?? "");
      setUsername(profile?.username ?? "");
    }
  }, [
    validateForm,
    shouldCheckUserId,
    isUserIdAvailable,
    updateProfile,
    formData,
  ]);

  const handleOnClose = useCallback(() => {
    onClose?.();
    setUserId(profile?.user_id ?? "");
    setUsername(profile?.username ?? "");
  }, [onClose, setUserId, setUsername, profile]);

  return (
    <ScrollableBottomSheetModal
      ref={ref}
      snapPoints={["50%", "90%"]}
      index={1}
      enablePanDownToClose={false}
      stackBehavior="switch"
    >
      <View className="flex-1 gap-4 px-4 pb-10">
        <ModalHeader
          title={t("users.setting_modal.profile_edit.title")}
          onClose={handleOnClose}
        />
        {/* User ID & Username Input */}
        <View className="w-full gap-2">
          <FormInput
            label={t("users.setting_modal.profile_edit.user_id")}
            placeholder={t(
              "users.setting_modal.profile_edit.user_id_placeholder",
            )}
            value={formData.user_id}
            onChangeText={setUserId}
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.user_id}
            helperText={userIdHelper?.text}
            helperTextColor={userIdHelper?.color}
            leftIcon={<AtSign size={16} color="#6B7280" />}
            returnKeyType="next"
            onSubmitEditing={() => usernameInputRef.current?.focus()}
            blurOnSubmit={false}
          />
          <FormInput
            ref={usernameInputRef}
            label={t("users.setting_modal.profile_edit.username")}
            placeholder={t(
              "users.setting_modal.profile_edit.username_placeholder",
            )}
            value={formData.username}
            onChangeText={setUsername}
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.username}
            leftIcon={<UserRound size={16} color="#6B7280" />}
            returnKeyType="done"
            onSubmitEditing={handleUpdateProfile}
          />
        </View>

        {/* Update Profile Button */}
        <View className="w-full pt-4">
          <FormButton
            title={
              isPending
                ? "Updating..."
                : isUnchanged
                  ? t("users.setting_modal.profile_edit.no_changes")
                  : t("users.setting_modal.profile_edit.update_profile")
            }
            onPress={handleUpdateProfile}
            disabled={!submitEnabled || isUnchanged}
          />
        </View>
      </View>
    </ScrollableBottomSheetModal>
  );
});

ProfileEditModal.displayName = "ProfileEditModal";
