import { forwardRef, useCallback, useMemo } from "react";

import { View } from "react-native";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";

import { ScrollableBottomSheetModal } from "@/src/shared/components/modals";
import ModalHeader from "@/src/shared/components/modals/ModalHeader";
import { useModal } from "@/src/shared/providers/ModalContext";

import LogoutButton from "../../auth/components/LogoutButton";
import SettingItem from "../components/setting/SettingItem";
import SettingMenuSection from "../components/setting/SettingMenuSection";
import UserCard from "../components/user/UserCard";
import { createSettingMenuData } from "../constants/settingMenuData";

interface SettingModalProps {
  onClose?: () => void;
  onCloseAll?: () => void;
}

export const SettingModal = forwardRef<BottomSheetModal, SettingModalProps>(
  ({ onClose, onCloseAll }, ref) => {
    const { openModal } = useModal();
    const handleOpenProfileEdit = useCallback(
      () => openModal("profileEdit"),
      [openModal],
    );

    const menuData = useMemo(() => createSettingMenuData(), []);
    return (
      <ScrollableBottomSheetModal
        ref={ref}
        snapPoints={["90%"]}
        enablePanDownToClose={false}
      >
        <View className="flex-1 gap-4 px-4 pb-4">
          {/* Header */}
          <ModalHeader
            title="Settings"
            onClose={
              onClose ??
              (() => {
                return;
              })
            }
          />

          {/* User Card */}
          <UserCard
            avatarSize="small"
            onPressEditProfile={handleOpenProfileEdit}
          />

          {/* Menu Items */}
          {menuData.map((menu) => (
            <SettingMenuSection key={menu.menuTitle} title={menu.menuTitle}>
              {menu.menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SettingItem
                    key={item.title}
                    title={item.title}
                    onPress={item.onPress ?? (() => {})}
                  >
                    <Icon {...item.iconProps} />
                  </SettingItem>
                );
              })}
            </SettingMenuSection>
          ))}

          {/* Logout Button */}
          <View className="w-full">
            <LogoutButton
              disabledColor="bg-red-400"
              enabledColor="bg-red-500"
              onLogoutSuccess={onCloseAll}
            />
          </View>
        </View>
      </ScrollableBottomSheetModal>
    );
  },
);

SettingModal.displayName = "SettingModal";
