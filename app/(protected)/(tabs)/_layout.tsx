import { useEffect } from "react";

import { useRouter } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

import { SafeAreaView } from "react-native-safe-area-context";

import { useProfile } from "@/src/features/users";

export default function TabsLayout() {
  const { data: profile, isLoading } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    // プロフィールが未設定の場合、initial-setupへリダイレクト
    if (!profile) {
      router.replace("/initial-setup");
    }
  }, [profile, isLoading, router]);

  // ローディング中またはプロフィール未設定の場合は何も表示しない
  if (isLoading || !profile) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1" edges={["right", "left"]}>
      <NativeTabs>
        <NativeTabs.Trigger name="index">
          <Label>Home</Label>
          <Icon sf={{ default: "house", selected: "house.fill" }} />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="swipes">
          <Label>Swipes</Label>
          <Icon sf="square.3.layers.3d" drawable="custom_android_drawable" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="link-list">
          <Label>Link List</Label>
          <Icon sf="list.bullet" drawable="custom_android_drawable" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="dashboard" role="search">
          <Label>Dashboard</Label>
          <Icon
            sf="chart.line.uptrend.xyaxis"
            drawable="custom_android_drawable"
          />
        </NativeTabs.Trigger>
      </NativeTabs>
    </SafeAreaView>
  );
}
