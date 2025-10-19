import { forwardRef } from "react";

import { View } from "react-native";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  Clock,
  File,
  HelpCircle,
  Info,
  KeyRound,
  Lock,
  MapPin,
  UserRound,
} from "lucide-react-native";

import { ScrollableBottomSheetModal } from "@/src/shared/components/modals";
import ModalHeader from "@/src/shared/components/modals/ModalHeader";
import { useModal } from "@/src/shared/providers";

import LogoutButton from "../../auth/components/LogoutButton";
import SettingItem from "../components/setting/SettingItem";
import SettingMenuSection from "../components/setting/SettingMenuSection";

interface SettingModalProps {
  onClose?: () => void;
}

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  onPress?: () => void;
}

interface MenuSection {
  menuTitle: string;
  menuItems: MenuItem[];
}

export const SettingModal = forwardRef<BottomSheetModal, SettingModalProps>(
  ({ onClose }, ref) => {
    const { openProfileEdit } = useModal();

    const menuData: MenuSection[] = [
      {
        menuTitle: "Your Account",
        menuItems: [
          {
            title: "Profile",
            icon: <UserRound size={16} color="#6B7280" />,
            onPress: () => {
              openProfileEdit();
            },
          },
          {
            title: "Password",
            icon: <KeyRound size={16} color="#6B7280" />,
          },
          {
            title: "Timezone",
            icon: <Clock size={16} color="#6B7280" />,
          },
          {
            title: "Location",
            icon: <MapPin size={16} color="#6B7280" />,
          },
        ],
      },
      {
        menuTitle: "App Information",
        menuItems: [
          {
            title: "Help",
            icon: <HelpCircle size={16} color="#6B7280" />,
          },
          {
            title: "Privacy Policy",
            icon: <Lock size={16} color="#6B7280" />,
          },
          {
            title: "Terms of Service",
            icon: <File size={16} color="#6B7280" />,
          },
          {
            title: "Version",
            icon: <Info size={16} color="#6B7280" />,
          },
        ],
      },
    ];
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

          {/* Menu Items */}
          {menuData.map((menu) => (
            <SettingMenuSection key={menu.menuTitle} title={menu.menuTitle}>
              {menu.menuItems.map((item) => (
                <SettingItem
                  key={item.title}
                  title={item.title}
                  onPress={item.onPress ?? (() => {})}
                >
                  {item.icon}
                </SettingItem>
              ))}
            </SettingMenuSection>
          ))}

          {/* Logout Button */}
          <View className="w-full">
            <LogoutButton
              disabledColor="bg-red-400"
              enabledColor="bg-red-500"
            />
          </View>
        </View>
      </ScrollableBottomSheetModal>
    );
  },
);

SettingModal.displayName = "SettingModal";
