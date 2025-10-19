import { ActivityIndicator, Text, View } from "react-native";

import LogoutButton from "@/src/features/auth/components/LogoutButton";
import { useProfile } from "@/src/features/users";
import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";

export default function Index() {
  const { data: profile, isLoading, error } = useProfile();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center p-4">
        <Text className="text-center text-red-600">
          プロフィールの読み込みに失敗しました
        </Text>
      </View>
    );
  }
  return (
    <ScreenContainer>
      <Text className="text-2xl font-bold">Home Screen</Text>
      <Text className="mb-8 text-center text-gray-600">You are logged in!</Text>
      <Text className="text-center text-gray-600">
        @{profile?.user_id || "..."} / {profile?.username || "..."}
      </Text>

      {/* Logout Button */}
      <View className="w-full">
        <LogoutButton />
      </View>
    </ScreenContainer>
  );
}
