import { forwardRef, useEffect, useState } from "react";

import { Text, View } from "react-native";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";

import { ScrollableBottomSheetModal } from "@/src/shared/components/modals";
import ModalHeader from "@/src/shared/components/modals/ModalHeader";
import {
  formatMonthDay,
  formatTime,
  getDeviceTimezone,
} from "@/src/shared/utils/timezone";

import LanguageSettings from "../components/setting/LanguageSettings";

interface LocaleSettingModalProps {
  onClose?: () => void;
}

export const LocaleSettingModal = forwardRef<
  BottomSheetModal,
  LocaleSettingModalProps
>(({ onClose }, ref) => {
  const [timeInfo, setTimeInfo] = useState<{
    time: string;
    monthDay: string;
    timezone: string;
  }>({
    time: "",
    timezone: "",
    monthDay: "",
  });

  useEffect(() => {
    const formattedTime = formatTime(new Date(), "long");
    const formattedMonthDay = formatMonthDay(new Date());
    const userTimezone = getDeviceTimezone();
    setTimeInfo({
      time: formattedTime,
      monthDay: formattedMonthDay,
      timezone: userTimezone,
    });
  }, []);

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
          title="Timezone & Language"
          onClose={onClose ?? (() => {})}
        />

        {/* Timezone info */}
        <View className="w-full flex-col items-start justify-start gap-2">
          <Text className="font-bold text-slate-500">Timezone</Text>
          <View className="w-full flex-col items-start justify-start gap-1 rounded-lg bg-slate-100 p-4">
            <Text className="text-xl font-bold text-slate-700">
              {timeInfo.time}
            </Text>
            <Text className=" text-slate-500">
              {timeInfo.monthDay}, {timeInfo.timezone}
            </Text>
          </View>
        </View>

        {/* Language info */}
        <LanguageSettings />
      </View>
    </ScrollableBottomSheetModal>
  );
});
