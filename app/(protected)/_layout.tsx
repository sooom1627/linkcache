import { useEffect } from "react";

import { ActivityIndicator, Text } from "react-native";

import { Slot, useRouter } from "expo-router";

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
  const { isLoading: isProfileLoading, isError: isProfileError } = useProfile();

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
        <ActivityIndicator size="large" color="#334155" />
      </SafeAreaView>
    );
  }

  if (shouldGoSignIn) {
    return null;
  }

  if (session && isProfileError) {
    return (
      <SafeAreaView className="relative flex-1 items-center justify-center bg-white">
        <Text>プロフィールの読み込みに失敗しました。</Text>
      </SafeAreaView>
    );
  }

  return <Slot />;
}
