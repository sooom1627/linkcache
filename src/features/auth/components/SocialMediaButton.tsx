import { Text, TouchableOpacity, View } from "react-native";

import { AntDesign, FontAwesome } from "@expo/vector-icons";

import { colors } from "@/src/shared/constants/colors";

export type Provider = "google" | "apple";

export interface SocialMediaButtonProps {
  provider: Provider;
  onPress: () => void;
}

const providerConfig = {
  google: {
    icon: "google" as const,
    iconFamily: "AntDesign" as const,
    label: "Continue with Google",
    bgColor: "bg-white",
    textColor: "text-slate-800",
    iconColor: colors.main,
    borderColor: "border border-slate-200",
  },
  apple: {
    icon: "apple" as const,
    iconFamily: "FontAwesome" as const,
    label: "Continue with Apple",
    bgColor: "bg-main",
    textColor: "text-white",
    iconColor: colors.textOnDark,
    borderColor: "",
  },
};

export default function SocialMediaButton({
  provider,
  onPress,
}: SocialMediaButtonProps) {
  const config = providerConfig[provider];

  return (
    <TouchableOpacity
      className={`flex-1 flex-row items-center justify-center rounded-lg p-4 ${config.bgColor} ${config.borderColor}`}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${config.label} button`}
    >
      <View className="mr-4">
        {config.iconFamily === "AntDesign" ? (
          <AntDesign name={config.icon} size={16} color={config.iconColor} />
        ) : (
          <FontAwesome name={config.icon} size={16} color={config.iconColor} />
        )}
      </View>
      <Text className={`text-sm font-semibold ${config.textColor}`}>
        {config.label}
      </Text>
    </TouchableOpacity>
  );
}
