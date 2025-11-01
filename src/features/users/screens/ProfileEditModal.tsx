import { forwardRef, useCallback, useEffect, useMemo, useRef } from "react";

import { Alert, Text, View, type TextInput } from "react-native";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { AtSign, UserRound } from "lucide-react-native";

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
            Alert.alert("Success", "Profile updated successfully");
          },
          onError: () => {
            Alert.alert("Error", "Failed to update profile");
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
        <ModalHeader title="Update Your Profile" onClose={handleOnClose} />
        {/* User ID & Username Input */}
        <View className="w-full gap-2">
          <View className="w-full">
            <Text className="text-slate-500">
              Update your user ID and display name
            </Text>
          </View>
          <FormInput
            label="User ID"
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
            label="Display Name"
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

        {/* Update Profile Button */}
        <View className="w-full pt-4">
          <FormButton
            title={
              isPending
                ? "Updating..."
                : isUnchanged
                  ? "No changes"
                  : "Update Profile"
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
