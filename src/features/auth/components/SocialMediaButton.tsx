import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import { AntDesign, FontAwesome } from "@expo/vector-icons";

export type Provider = "google" | "github" | "apple";

export interface SocialMediaButtonProps {
  provider: Provider;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const providerConfig = {
  google: {
    icon: "google" as const,
    iconFamily: "AntDesign" as const,
    label: "Continue with Google",
    bgColor: "bg-white",
    textColor: "text-gray-800",
    iconColor: "#1f2937",
    borderColor: "border border-gray-300",
  },
  github: {
    icon: "github" as const,
    iconFamily: "AntDesign" as const,
    label: "Continue with GitHub",
    bgColor: "bg-zinc-900",
    textColor: "text-white",
    iconColor: "white",
    borderColor: "",
  },
  apple: {
    icon: "apple" as const,
    iconFamily: "FontAwesome" as const,
    label: "Continue with Apple",
    bgColor: "bg-zinc-800",
    textColor: "text-white",
    iconColor: "white",
    borderColor: "",
  },
};

export default function SocialMediaButton({
  provider,
  onPress,
  disabled = false,
  loading = false,
}: SocialMediaButtonProps) {
  const config = providerConfig[provider];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={`w-full flex-row items-center justify-center rounded-lg p-4 ${config.bgColor} ${config.borderColor} ${
        isDisabled ? "opacity-60" : ""
      }`}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={`${config.label} button`}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      <View className="absolute left-4">
        {config.iconFamily === "AntDesign" ? (
          <AntDesign name={config.icon} size={20} color={config.iconColor} />
        ) : (
          <FontAwesome name={config.icon} size={20} color={config.iconColor} />
        )}
      </View>
      <Text className={`font-semibold ${config.textColor}`}>
        {config.label}
      </Text>
      {loading ? (
        <View className="absolute right-4">
          <ActivityIndicator size="small" color={config.iconColor} />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}
