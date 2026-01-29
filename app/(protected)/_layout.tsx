import { useEffect } from "react";

import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

import { Stack, useRouter } from "expo-router";

import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/features/auth";
import { useProfile } from "@/src/features/users";

/**
 * 保護されたルートのレイアウト
 * 認証状態に基づいてリダイレクトを管理
 */
export default function ProtectedLayout() {
  const router = useRouter();
  const { session, isLoading: isSessionLoading } = useAuth();
  const { isLoading: isProfileLoading, isError: error, refetch } = useProfile();

  const isLoading = isSessionLoading || isProfileLoading;
  const shouldGoSignIn = !session;

  useEffect(() => {
    if (isLoading) return;

    if (shouldGoSignIn) {
      router.replace("/sign-in");
    }
  }, [isLoading, shouldGoSignIn, router]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#6B7280" />
      </SafeAreaView>
    );
  }

  if (shouldGoSignIn) {
    return null;
  }

  if (session && error) {
    return (
      <SafeAreaView className="relative flex-1 items-center justify-center bg-white">
        <Text>Failed to load profile</Text>
        <TouchableOpacity
          className="mt-4 rounded-lg bg-slate-700 px-6 py-3"
          accessibilityRole="button"
          accessibilityLabel="Reload profile"
          onPress={() => {
            refetch();
          }}
        >
          <Text className="text-center font-semibold text-white">
            Reload profile
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="link"
        options={{
          headerShown: false,
          animation: "slide_from_right",
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="links"
        options={{
          headerShown: false,
          animation: "slide_from_right",
          presentation: "card",
        }}
      />
    </Stack>
  );
}
