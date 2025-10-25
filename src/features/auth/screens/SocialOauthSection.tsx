import { Text, View } from "react-native";

import SocialMediaButton from "../components/SocialMediaButton";

export default function SocialOauthSection({ title }: { title: string }) {
  return (
    <View className="flex w-full flex-col items-center justify-center gap-4">
      <View className="flex w-full flex-col items-center justify-center gap-2">
        <Text className="text-slate-700">
          {title} with your favorite social media account.
        </Text>
      </View>
      <View className="flex w-full flex-row items-center gap-4">
        <SocialMediaButton provider="google" onPress={() => void 0} />
        <SocialMediaButton provider="apple" onPress={() => void 0} />
      </View>
    </View>
  );
}
