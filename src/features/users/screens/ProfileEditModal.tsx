import { forwardRef, useCallback, useEffect, useRef } from "react";

import { Text, View, type TextInput } from "react-native";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { AtSign, UserRound } from "lucide-react-native";

import { FormButton, FormInput } from "@/src/shared/components/forms";
import { ScrollableBottomSheetModal } from "@/src/shared/components/modals";
import ModalHeader from "@/src/shared/components/modals/ModalHeader";

import { useProfile } from "../hooks";
import { useProfileForm } from "../hooks/useProfileForm";
import { useUpdateProfile } from "../hooks/useUpdateProfile";

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
  const { formData, setUserId, setUsername, validateForm } = useProfileForm();

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

  const handleUpdateProfile = useCallback(() => {
    if (!validateForm()) return;

    updateProfile(formData);
  }, [validateForm, updateProfile, formData]);

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
            leftIcon={<AtSign size={16} color="#6B7280" />}
            returnKeyType="next"
            onSubmitEditing={() => usernameInputRef.current?.focus()}
            blurOnSubmit={false}
          />
          <FormInput
            ref={usernameInputRef}
            placeholder="Username"
            value={formData.username}
            onChangeText={setUsername}
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon={<UserRound size={16} color="#6B7280" />}
            returnKeyType="done"
            onSubmitEditing={handleUpdateProfile}
          />
        </View>
        <FormButton
          title={isPending ? "Updating..." : "Update Profile"}
          onPress={handleUpdateProfile}
          disabled={isPending}
        />
      </View>
    </ScrollableBottomSheetModal>
  );
});

ProfileEditModal.displayName = "ProfileEditModal";
