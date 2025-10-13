import { Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import LogoutButton from "@/src/features/auth/components/LogoutButton";
import { useProfile } from "@/src/features/users";

export default function Index() {
  const { data: profile } = useProfile();

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 items-center justify-center p-4">
        <Text className="mb-4 text-2xl font-bold">Home Screen</Text>
        <Text className="mb-8 text-center text-gray-600">
          You are logged in!
        </Text>
        <Text className="mb-8 text-center text-gray-600">
          @{profile?.user_id || "..."} / {profile?.username || "..."}
        </Text>

        {/* Logout Button */}
        <View className="w-full">
          <LogoutButton />
        </View>
      </View>
    </SafeAreaView>
  );
}
