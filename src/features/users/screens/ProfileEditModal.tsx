import { forwardRef, useCallback, useState } from "react";

import { Text, View } from "react-native";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { AtSign, UserRound } from "lucide-react-native";

import { FormButton, FormInput } from "@/src/shared/components/forms";
import { ScrollableBottomSheetModal } from "@/src/shared/components/modals";
import ModalHeader from "@/src/shared/components/modals/ModalHeader";

import { useProfile } from "../hooks";
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
  const { mutate: updateProfile, isPending } = useUpdateProfile({
    onSuccess: () => {
      onClose?.();
    },
  });
  const [userId, setUserId] = useState<string>(profile?.user_id ?? "");
  const [username, setUsername] = useState<string>(profile?.username ?? "");

  const handleUpdateProfile = useCallback(() => {
    updateProfile({
      user_id: userId,
      username: username,
    });
  }, [updateProfile, userId, username]);

  return (
    <ScrollableBottomSheetModal
      ref={ref}
      snapPoints={["90%"]}
      enablePanDownToClose={false}
    >
      <View className="flex-1 gap-4 px-4 pb-4">
        <ModalHeader title="Profile Edit" onClose={onClose ?? noop} />
        {/* User ID & Username Input */}
        <View className="w-full gap-4">
          <Text>User ID & Username</Text>
          <FormInput
            placeholder="User ID"
            value={userId}
            onChangeText={setUserId}
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon={<AtSign size={16} color="#6B7280" />}
          />
          <FormInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon={<UserRound size={16} color="#6B7280" />}
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
