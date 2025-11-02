import type { ComponentType } from "react";

import type { TFunction } from "i18next";
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
  t: TFunction<"translation", undefined>,
): MenuSection[] => [
  {
    menuTitle: t("user_messages.setting_modal.account_title"),
    menuItems: [
      {
        title: t("user_messages.setting_modal.menu_items.password"),
        icon: KeyRound,
        iconProps: ICON_PROPS,
      },
      {
        title: t("user_messages.setting_modal.menu_items.timezone_language"),
        icon: Earth,
        iconProps: ICON_PROPS,
        onPress: () => {
          openModal("localeSetting");
        },
      },
    ],
  },
  {
    menuTitle: t("user_messages.setting_modal.information_title"),
    menuItems: [
      {
        title: t("user_messages.setting_modal.menu_items.help"),
        icon: HelpCircle,
        iconProps: ICON_PROPS,
      },
      {
        title: t("user_messages.setting_modal.menu_items.privacy_policy"),
        icon: Lock,
        iconProps: ICON_PROPS,
      },
      {
        title: t("user_messages.setting_modal.menu_items.terms_of_service"),
        icon: File,
        iconProps: ICON_PROPS,
      },
      {
        title: t("user_messages.setting_modal.menu_items.version"),
        icon: Info,
        iconProps: ICON_PROPS,
      },
    ],
  },
];
