import { useEffect } from "react";

import { View } from "react-native";

import { usePathname, useRouter } from "expo-router";
import { TabList, Tabs, TabSlot, TabTrigger } from "expo-router/ui";

import { House, Layers2, List } from "lucide-react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { useProfile } from "@/src/features/users";

const tabs = [
  { name: "index", href: "/" as const, icon: House },
  { name: "link-list", href: "/link-list" as const, icon: List },
  { name: "swipes", href: "/swipes" as const, icon: Layers2 },
] as const;

export default function TabsLayout() {
  const { data: profile, isLoading } = useProfile();
  const router = useRouter();
  const pathname = usePathname();

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

  // アニメーションスタイル
  const createTabStyle = (isActive: boolean) =>
    useAnimatedStyle(() => ({
      backgroundColor: withTiming(
        isActive ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0)",
        {
          duration: 200,
        },
      ),
      transform: [
        {
          scale: withTiming(isActive ? 1.05 : 1, {
            duration: 200,
          }),
        },
      ],
    }));

  return (
    <SafeAreaView className="flex-1 bg-white/60">
      <Tabs>
        <Animated.View
          key={pathname}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          className="flex-1"
        >
          <TabSlot />
        </Animated.View>
        <TabList asChild={true} className="absolute inset-x-6 bottom-0">
          <View
            className="flex-row items-center justify-around self-center rounded-full border border-zinc-800/30 bg-zinc-100/90 p-2"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              const tabStyle = createTabStyle(isActive);
              const Icon = tab.icon;

              return (
                <TabTrigger
                  key={tab.name}
                  name={tab.name}
                  href={tab.href}
                  className="flex-1"
                >
                  <Animated.View
                    style={tabStyle}
                    className="flex-1 items-center justify-center rounded-full py-3"
                  >
                    <Icon color={isActive ? "#18181b" : "#a1a1aa"} />
                  </Animated.View>
                </TabTrigger>
              );
            })}
          </View>
        </TabList>
      </Tabs>
    </SafeAreaView>
  );
}
