import { forwardRef } from "react";

import { Text, TextInput, View } from "react-native";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";

import { ScrollableBottomSheetModal } from "@/src/shared/components/modals";
import ModalHeader from "@/src/shared/components/modals/ModalHeader";

interface ProfileEditModalProps {
  onClose?: () => void;
}
export const ProfileEditModal = forwardRef<
  BottomSheetModal,
  ProfileEditModalProps
>(({ onClose }, ref) => {
  return (
    <ScrollableBottomSheetModal
      ref={ref}
      snapPoints={["90%"]}
      enablePanDownToClose={false}
    >
      <View className="flex-1 gap-4 px-4 pb-4">
        <ModalHeader title="Profile Edit" onClose={onClose ?? (() => {})} />
        {/* User ID & Username Input */}
        <View className="w-full gap-4">
          <Text>User ID & Username</Text>
          <TextInput />
        </View>
      </View>
    </ScrollableBottomSheetModal>
  );
});
