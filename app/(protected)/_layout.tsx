import { useEffect } from "react";

import { ActivityIndicator } from "react-native";

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
  const segments = useSegments();
  const { session, isLoading: isSessionLoading } = useAuthSession();
  const { data: profile, isLoading: isProfileLoading } = useProfile();

  useEffect(() => {
    // ローディング中は何もしない
    if (isSessionLoading || isProfileLoading) return;

    const inProtected = segments[0] === "(protected)";

    // 未認証の場合、サインイン画面へリダイレクト
    if (!session && inProtected) {
      router.replace("/sign-in");
      return;
    }

    // 認証済みだがプロフィール未設定の場合
    if (session && !profile) {
      // setup-profile画面以外にいる場合、setup-profileへリダイレクト
      const isOnSetupProfile = (segments as string[]).includes("setup-profile");
      if (!isOnSetupProfile) {
        router.replace("/(protected)/setup-profile");
      }
      return;
    }

    // 認証済み & プロフィール設定済みの場合
    if (session && profile) {
      // setup-profile画面にいる場合、メイン画面へリダイレクト
      const isOnSetupProfile = (segments as string[]).includes("setup-profile");
      if (isOnSetupProfile) {
        router.replace("/(protected)/(tabs)");
      }
    }
  }, [session, profile, isSessionLoading, isProfileLoading, segments, router]);

  // ローディング中は何も表示しない
  if (isSessionLoading || isProfileLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return <Slot />;
}
