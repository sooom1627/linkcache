import { useEffect } from "react";

import { Tabs, useRouter } from "expo-router";

import { useProfile } from "@/src/features/users";

export default function TabsLayout() {
  const { data: profile, isLoading } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    // プロフィールが未設定の場合、setup-profileへリダイレクト
    if (!profile) {
      router.replace("/setup-profile");
    }
  }, [profile, isLoading, router]);

  // ローディング中またはプロフィール未設定の場合は何も表示しない
  if (isLoading || !profile) {
    return null;
  }

  return <Tabs />;
}
