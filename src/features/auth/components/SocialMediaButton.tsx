import { Text, TouchableOpacity, View } from "react-native";

import { AntDesign, FontAwesome } from "@expo/vector-icons";

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
    textColor: "text-gray-800",
    iconColor: "#1f2937",
    borderColor: "border border-gray-300",
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
}: SocialMediaButtonProps) {
  const config = providerConfig[provider];

  return (
    <TouchableOpacity
      className={`w-full flex-row items-center justify-center rounded-lg p-4 ${config.bgColor} ${config.borderColor}`}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${config.label} button`}
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
    </TouchableOpacity>
  );
}
