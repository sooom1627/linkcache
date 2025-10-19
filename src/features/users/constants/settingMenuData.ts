import type { ComponentType } from "react";

import type { LucideProps } from "lucide-react-native";
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
  handleOpenProfileEdit: () => void,
): MenuSection[] => [
  {
    menuTitle: "Your Account",
    menuItems: [
      {
        title: "Profile",
        icon: UserRound,
        iconProps: ICON_PROPS,
        onPress: handleOpenProfileEdit,
      },
      {
        title: "Password",
        icon: KeyRound,
        iconProps: ICON_PROPS,
      },
      {
        title: "Timezone",
        icon: Clock,
        iconProps: ICON_PROPS,
      },
      {
        title: "Location",
        icon: MapPin,
        iconProps: ICON_PROPS,
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
