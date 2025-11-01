import type { ComponentType } from "react";

import type { LucideProps } from "lucide-react-native";
import {
  Earth,
  File,
  HelpCircle,
  Info,
  KeyRound,
  Lock,
} from "lucide-react-native";

import type { ModalType } from "@/src/shared/providers";

export interface MenuItem {
  title: string;
  icon: ComponentType<LucideProps>;
  iconProps?: LucideProps;
  onPress?: () => void;
}

export interface MenuSection {
  menuTitle: string;
  menuItems: MenuItem[];
}

const ICON_PROPS: LucideProps = { size: 16, color: "#6B7280" };

export const createSettingMenuData = (
  openModal: (modalType: ModalType) => void,
): MenuSection[] => [
  {
    menuTitle: "Your Account",
    menuItems: [
      {
        title: "Password",
        icon: KeyRound,
        iconProps: ICON_PROPS,
      },
      {
        title: "Timezone & Language",
        icon: Earth,
        iconProps: ICON_PROPS,
        onPress: () => {
          openModal("localeSetting");
        },
      },
    ],
  },
  {
    menuTitle: "App Information",
    menuItems: [
      {
        title: "Help",
        icon: HelpCircle,
        iconProps: ICON_PROPS,
      },
      {
        title: "Privacy Policy",
        icon: Lock,
        iconProps: ICON_PROPS,
      },
      {
        title: "Terms of Service",
        icon: File,
        iconProps: ICON_PROPS,
      },
      {
        title: "Version",
        icon: Info,
        iconProps: ICON_PROPS,
      },
    ],
  },
];
