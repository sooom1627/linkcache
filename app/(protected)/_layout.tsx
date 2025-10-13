import { useEffect } from "react";

import { ActivityIndicator, Text } from "react-native";

import { Slot, useRouter, useSegments } from "expo-router";

import { SafeAreaView } from "react-native-safe-area-context";

import { useAuthSession } from "@/src/features/auth";
import { useProfile } from "@/src/features/users";

/**
 * 保護されたルートのレイアウト
 * 認証状態とプロフィール設定状態に基づいてリダイレクトを管理
 */
export default function ProtectedLayout() {
  const router = useRouter();
  const segments = useSegments() as string[];
  const { session, isLoading: isSessionLoading } = useAuthSession();
  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useProfile();

  const isLoading = isSessionLoading || isProfileLoading;
  const isOnSetupProfile = segments.includes("setup-profile");
  const shouldGoSignIn = !session;
  const shouldGoSetupProfile =
    !!session && !profile && !isProfileError && !isOnSetupProfile;
  const shouldGoTabs = !!session && !!profile && isOnSetupProfile;

  useEffect(() => {
    if (isLoading) return;

    if (shouldGoSignIn) {
      router.replace("/sign-in");
      return;
    }

    if (shouldGoSetupProfile) {
      router.replace("/(protected)/setup-profile");
      return;
    }

    if (shouldGoTabs) {
      router.replace("/(protected)/(tabs)");
    }
  }, [isLoading, shouldGoSignIn, shouldGoSetupProfile, shouldGoTabs, router]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (shouldGoSignIn || shouldGoSetupProfile || shouldGoTabs) {
    return null;
  }

  if (session && isProfileError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text>プロフィールの読み込みに失敗しました。</Text>
      </SafeAreaView>
    );
  }

  return <Slot />;
}
