import { useEffect } from "react";

import { View } from "react-native";

import { useRouter } from "expo-router";
import { TabList, Tabs, TabSlot, TabTrigger } from "expo-router/ui";
import { Ionicons } from "@expo/vector-icons";

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

  return (
    <Tabs>
      <TabSlot />
      <TabList asChild={true} className="absolute bottom-10 mx-10 w-full">
        <View className="w-10/12 flex-row items-center justify-around rounded-full bg-white/50 px-10 py-4">
          <TabTrigger name="index" href="/" className="">
            <Ionicons name="home-outline" size={24} color="currentColor" />
          </TabTrigger>
          <TabTrigger name="link-list" href="/link-list" className="">
            <Ionicons name="newspaper-outline" size={24} color="currentColor" />
          </TabTrigger>
          <TabTrigger name="swipes" href="/swipes" className="">
            <Ionicons name="sparkles-outline" size={24} color="currentColor" />
          </TabTrigger>
        </View>
      </TabList>
    </Tabs>
  );
}
