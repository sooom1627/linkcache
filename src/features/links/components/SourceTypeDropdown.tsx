import { useEffect, useState } from "react";

import { Pressable, Text, View } from "react-native";

import { ChevronDown } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface SourceTypeDropdownProps {
  value: "inbox" | "later" | "read_soon";
  onChange: (value: "inbox" | "later" | "read_soon") => void;
}

/**
 * ソースタイプ選択用のドロップダウンメニューコンポーネント
 *
 * inbox/later の選択を提供するドロップダウンメニューです。
 * ChevronDown アイコンの回転アニメーションを含みます。
 */
export function SourceTypeDropdown({
  value,
  onChange,
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

  const handleSelect = (type: "inbox" | "later" | "read_soon") => {
    onChange(type);
    setIsOpen(false);
  };

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
          <ChevronDown size={16} color="#64748B" />
        </Animated.View>
      </Pressable>

      {/* Dropdown Menu */}
      {isOpen && (
        <View className="absolute top-full z-30 mt-2 w-48 rounded-xl border border-slate-100 bg-white shadow-xl">
          <Pressable
            onPress={() => handleSelect("inbox")}
            accessibilityRole="button"
            accessibilityState={{ selected: value === "inbox" }}
            accessibilityLabel={t("links.card.action_modal.status.inbox")}
            className={`rounded-t-xl px-4 py-3 ${
              value === "inbox" ? "bg-slate-50" : "active:bg-slate-50"
            }`}
          >
            <Text
              className={`text-center text-sm font-medium ${
                value === "inbox" ? "text-slate-900" : "text-slate-600"
              }`}
            >
              {t("links.card.action_modal.status.inbox")}
            </Text>
          </Pressable>

          <View className="h-px w-full bg-slate-100" />

          <Pressable
            onPress={() => handleSelect("read_soon")}
            accessibilityRole="button"
            accessibilityState={{ selected: value === "read_soon" }}
            accessibilityLabel={t("links.card.action_modal.status.read_soon")}
            className={`px-4 py-3 ${
              value === "read_soon" ? "bg-slate-50" : "active:bg-slate-50"
            }`}
          >
            <Text
              className={`text-center text-sm font-medium ${
                value === "read_soon" ? "text-slate-900" : "text-slate-600"
              }`}
            >
              {t("links.card.action_modal.status.read_soon")}
            </Text>
          </Pressable>

          <View className="h-px w-full bg-slate-100" />

          <Pressable
            onPress={() => handleSelect("later")}
            accessibilityRole="button"
            accessibilityState={{ selected: value === "later" }}
            accessibilityLabel={t("links.card.action_modal.status.later")}
            className={`rounded-b-xl px-4 py-3 ${
              value === "later" ? "bg-slate-50" : "active:bg-slate-50"
            }`}
          >
            <Text
              className={`text-center text-sm font-medium ${
                value === "later" ? "text-slate-900" : "text-slate-600"
              }`}
            >
              {t("links.card.action_modal.status.later")}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
