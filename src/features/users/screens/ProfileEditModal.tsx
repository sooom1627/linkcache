import { forwardRef, useCallback, useEffect, useMemo, useRef } from "react";

import { Text, View, type TextInput } from "react-native";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { AtSign, UserRound } from "lucide-react-native";

import { FormButton, FormInput } from "@/src/shared/components/forms";
import { ScrollableBottomSheetModal } from "@/src/shared/components/modals";
import ModalHeader from "@/src/shared/components/modals/ModalHeader";

import { useCheckUserId, useProfile } from "../hooks";
import { useProfileForm } from "../hooks/useProfileForm";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { getUserIdHelperText } from "../utils";

interface ProfileEditModalProps {
  onClose?: () => void;
}

const noop = () => {};

export const ProfileEditModal = forwardRef<
  BottomSheetModal,
  ProfileEditModalProps
>(({ onClose }, ref) => {
  const { data: profile } = useProfile();

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
  const userIdHelper = useMemo(() => {
    // 元のIDと同じ場合はヘルパーテキスト不要
    if (formData.user_id === originalUserId) {
      return undefined;
    }
    return getUserIdHelperText(
      formData.user_id,
      isCheckingUserId,
      checkError,
      isUserIdAvailable,
    );
  }, [
    formData.user_id,
    originalUserId,
    isCheckingUserId,
    checkError,
    isUserIdAvailable,
  ]);

  // 送信ボタン有効化判定
  const isSubmitDisabled = useMemo(() => {
    // 処理中は無効
    if (isPending || isCheckingUserId) return true;

    // バリデーションエラーがある場合は無効
    if (errors.user_id || errors.username) return true;

    // 最小文字数チェック
    if (formData.user_id.length < 4 || formData.username.length < 4)
      return true;

    // user_idが変更されている場合は重複チェック必須
    if (shouldCheckUserId && isUserIdAvailable !== true) return true;

    return false;
  }, [
    isPending,
    isCheckingUserId,
    errors,
    formData.user_id,
    formData.username,
    shouldCheckUserId,
    isUserIdAvailable,
  ]);

  const handleUpdateProfile = useCallback(() => {
    if (!validateForm()) return;

    // user_idが変更されている場合は重複チェック必須
    if (shouldCheckUserId && isUserIdAvailable !== true) return;

    updateProfile(formData);
  }, [
    validateForm,
    shouldCheckUserId,
    isUserIdAvailable,
    updateProfile,
    formData,
  ]);

  return (
    <ScrollableBottomSheetModal
      ref={ref}
      snapPoints={["90%"]}
      enablePanDownToClose={false}
    >
      <View className="flex-1 gap-4 px-4 pb-4">
        <ModalHeader title="Update Your Profile" onClose={onClose ?? noop} />
        {/* User ID & Username Input */}
        <View className="w-full gap-4">
          <View className="w-full">
            <Text className="text-slate-500">
              Update your user ID and display name
            </Text>
          </View>
          <FormInput
            placeholder="User ID (4-32 characters)"
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
            placeholder="Display Name (4-32 characters)"
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
        <FormButton
          title={isPending ? "Updating..." : "Update Profile"}
          onPress={handleUpdateProfile}
          disabled={isSubmitDisabled}
        />
      </View>
    </ScrollableBottomSheetModal>
  );
});

ProfileEditModal.displayName = "ProfileEditModal";
