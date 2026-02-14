import { useEffect, useState } from "react";

import { ChevronDown } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/src/shared/constants/colors";
import { Pressable, Text, View } from "@/src/tw";

import type { TriageStatus } from "../types/linkList.types";

/** SourceTypeDropdownで使用可能なステータス（TriageStatusと同義） */
type SourceType = TriageStatus;

interface SourceTypeDropdownProps {
  value: SourceType;
  onChange: (value: SourceType) => void;
  allowedTypes?: SourceType[];
}

/**
 * ソースタイプ選択用のドロップダウンメニューコンポーネント
 *
 * new/read_soon/stock/done の選択を提供するドロップダウンメニューです。
 * ChevronDown アイコンの回転アニメーションを含みます。
 */
export function SourceTypeDropdown({
  value,
  onChange,
  allowedTypes = ["new", "read_soon", "stock", "done"],
}: SourceTypeDropdownProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // 回転アニメーション用のSharedValue
  const rotation = useSharedValue(0);

  // isOpenの変更に応じて回転角度をアニメーション
  useEffect(() => {
    rotation.value = withTiming(isOpen ? 180 : 0, { duration: 200 });
  }, [isOpen, rotation]);

  // アニメーションスタイル
  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const handleSelect = (type: SourceType) => {
    onChange(type);
    setIsOpen(false);
  };

  // 表示するオプションのリスト
  const options = [
    { type: "new", label: t("links.card.action_modal.status.new") },
    { type: "read_soon", label: t("links.card.action_modal.status.read_soon") },
    { type: "stock", label: t("links.card.action_modal.status.stock") },
    { type: "done", label: t("links.card.action_modal.status.done") },
  ] as const satisfies readonly { type: SourceType; label: string }[];

  const filteredOptions = options.filter((option) =>
    allowedTypes.includes(option.type),
  );

  return (
    <View className="relative">
      {/* Dropdown Trigger */}
      <Pressable
        onPress={() => setIsOpen(!isOpen)}
        accessibilityRole="button"
        accessibilityLabel={`${t("links.card.action_modal.current_mode", {
          status: t(`links.card.action_modal.status.${value}`),
        })}. ${t("links.card.action_modal.tap_to_change")}`}
        className="flex-row items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 active:bg-slate-50"
      >
        <Text className="text-sm font-medium text-slate-500">
          {t("links.card.action_modal.mode_label")}
        </Text>
        <Text className="text-sm font-bold text-slate-800">
          {t(`links.card.action_modal.status.${value}`)}
        </Text>
        <Animated.View style={chevronAnimatedStyle}>
          <ChevronDown size={16} color={colors.icon} />
        </Animated.View>
      </Pressable>

      {/* Dropdown Menu */}
      {isOpen && (
        <View className="absolute top-full z-30 mt-2 w-48 rounded-xl border border-slate-100 bg-white shadow-xl">
          {filteredOptions.map((option, index) => {
            const isSelected = value === option.type;
            const isFirst = index === 0;
            const isLast = index === filteredOptions.length - 1;

            return (
              <View key={option.type}>
                <Pressable
                  onPress={() => handleSelect(option.type)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={option.label}
                  className={`px-4 py-3 ${
                    isFirst ? "rounded-t-xl" : ""
                  } ${isLast ? "rounded-b-xl" : ""} ${
                    isSelected ? "bg-slate-50" : "active:bg-slate-50"
                  }`}
                >
                  <Text
                    className={`text-center text-sm font-medium ${
                      isSelected ? "text-slate-900" : "text-slate-600"
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
                {!isLast && <View className="h-px w-full bg-slate-100" />}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
