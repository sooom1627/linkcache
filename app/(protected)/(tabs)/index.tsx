import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import LogoutButton from "@/src/features/auth/components/LogoutButton";
import { useProfile } from "@/src/features/users";
import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";

export default function Index() {
  const { data: profile, isLoading, error, refetch } = useProfile();

  if (isLoading) {
    return (
      <ScreenContainer scrollable={false}>
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer scrollable={false}>
        <Text className="text-center text-red-600">
          プロフィールの読み込みに失敗しました
        </Text>
        <TouchableOpacity
          className="mt-4 rounded-lg bg-blue-500 px-6 py-3"
          accessibilityRole="button"
          accessibilityLabel="プロフィールを再読み込み"
          onPress={() => {
            refetch();
          }}
        >
          <Text className="text-center font-semibold text-white">
            再読み込み
          </Text>
        </TouchableOpacity>
      </ScreenContainer>
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
