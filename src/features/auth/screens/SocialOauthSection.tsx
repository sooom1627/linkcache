import { View } from "react-native";

import { Text } from "@react-navigation/elements";

import SocialMediaButton from "../components/SocialMediaButton";

export default function SocialOauthSection() {
  return (
    <View className="flex w-full flex-col items-center justify-center gap-4">
      <View className="flex w-full flex-col items-center justify-center gap-2">
        <Text className="text-zinc-700">
          SignIn with your favorite social media account.
        </Text>
      </View>
      <View className="flex w-full flex-col items-center gap-4">
        <SocialMediaButton provider="google" />
        <SocialMediaButton provider="apple" />
      </View>
    </View>
  );
}
