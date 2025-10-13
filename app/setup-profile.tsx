import { useEffect } from "react";

import { Alert } from "react-native";

import { useRouter } from "expo-router";

import { useQueryClient } from "@tanstack/react-query";

import { SetupProfileScreen, useProfile } from "@/src/features/users";

/**
 * プロフィール設定画面のエントリーポイント
 * プロフィール設定済みチェックとリダイレクト処理を担当
 */
export default function SetupProfile() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // プロフィール設定済みチェック
  const { data: profile, isLoading: isProfileLoading } = useProfile();

  // プロフィール設定済みの場合はメイン画面へリダイレクト
  useEffect(() => {
    if (!isProfileLoading && profile) {
      router.replace("/(tabs)");
    }
  }, [profile, isProfileLoading, router]);

  // 成功時のコールバック
  const handleSuccess = () => {
    // プロフィールキャッシュを無効化
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    Alert.alert("Success", "Profile created successfully!", [
      { text: "OK", onPress: () => router.replace("/(tabs)") },
    ]);
  };

  // エラー時のコールバック
  const handleError = (error: Error) => {
    Alert.alert("Profile Setup Failed", error.message);
  };

  // ローディング中またはプロフィール設定済みの場合は何も表示しない
  if (isProfileLoading || profile) {
    return null;
  }

  return <SetupProfileScreen onSuccess={handleSuccess} onError={handleError} />;
}
