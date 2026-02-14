import { forwardRef } from "react";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";

import { ScrollableBottomSheetModal } from "@/src/shared/components/modals";
import ModalHeader from "@/src/shared/components/modals/ModalHeader";
import {
  useFormattedMonthDay,
  useFormattedTime,
} from "@/src/shared/hooks/useDateTime";
import { getDeviceTimezone } from "@/src/shared/utils/timezone";
import { Text, View } from "@/src/tw";

import LanguageSettings from "../components/setting/LanguageSettings";

interface LocaleSettingModalProps {
  onClose?: () => void;
}

export const LocaleSettingModal = forwardRef<
  BottomSheetModal,
  LocaleSettingModalProps
>(({ onClose }, ref) => {
  const { t } = useTranslation();
  const formattedTime = useFormattedTime("long");
  const formattedMonthDay = useFormattedMonthDay();
  const timezone = getDeviceTimezone();

  return (
    <ScrollableBottomSheetModal
      ref={ref}
      snapPoints={["50%", "90%"]}
      index={1}
      enablePanDownToClose={false}
      stackBehavior="switch"
    >
      <View className="flex-1 gap-4 px-4 pb-4">
        <ModalHeader
          title={t("users.setting_modal.locale_setting.title")}
          onClose={onClose || (() => {})}
        />

        {/* Timezone info */}
        <View className="w-full flex-col items-start justify-start gap-2">
          <Text className="font-bold text-slate-500">
            {t("users.setting_modal.locale_setting.timezone")}
            <Text className="pl-1 text-sm font-normal text-slate-500">
              {" - " + t("users.setting_modal.locale_setting.timezone_info")}
            </Text>
          </Text>
          <View className="bg-surface-muted w-full flex-col items-start justify-start gap-1 rounded-lg p-4">
            <Text className="text-xl font-bold text-slate-700">
              {formattedTime}
            </Text>
            <Text className=" text-slate-500">
              {formattedMonthDay}, {timezone}
            </Text>
          </View>
        </View>

        {/* Language info */}
        <LanguageSettings />
      </View>
    </ScrollableBottomSheetModal>
  );
});
