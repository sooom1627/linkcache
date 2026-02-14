import { forwardRef, useCallback, useMemo } from "react";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";

import { ScrollableBottomSheetModal } from "@/src/shared/components/modals";
import ModalHeader from "@/src/shared/components/modals/ModalHeader";
import { useModal } from "@/src/shared/providers/ModalContext";
import { View } from "@/src/tw";

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
    const { t, i18n } = useTranslation();
    const handleOpenProfileEdit = useCallback(
      () => openModal("profileEdit"),
      [openModal],
    );

    const menuData = useMemo(
      () => createSettingMenuData(openModal, t),
      [openModal, t, i18n.language],
    );

    return (
      <ScrollableBottomSheetModal
        ref={ref}
        snapPoints={["70%", "90%"]}
        index={1}
        enablePanDownToClose={false}
        stackBehavior="push"
      >
        <View className="flex-1 gap-4 px-4 pb-4">
          {/* Header */}
          <ModalHeader
            title={t("users.setting_modal.title")}
            onClose={
              onClose ??
              (() => {
                return;
              })
            }
          />

          {/* User Card */}
          <UserCard
            avatarSize="large"
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
            <LogoutButton onLogoutSuccess={onCloseAll} />
          </View>
        </View>
      </ScrollableBottomSheetModal>
    );
  },
);

SettingModal.displayName = "SettingModal";
