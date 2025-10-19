import { useEffect, useMemo } from "react";

import { View } from "react-native";

import { usePathname, useRouter } from "expo-router";
import { TabList, Tabs, TabSlot, TabTrigger } from "expo-router/ui";

import { ChartNoAxesCombined, House, Layers2, List } from "lucide-react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useProfile } from "@/src/features/users";
import type { TabItem } from "@/src/shared/types/Tabs.types";

const tabs: TabItem[] = [
  { name: "index", href: "/", icon: House },
  { name: "swipes", href: "/swipes", icon: Layers2 },
  { name: "link-list", href: "/link-list", icon: List },
  { name: "dashboard", href: "/dashboard", icon: ChartNoAxesCombined },
];

const tabBarStyle = {
  width: 260,
  justifyContent: "space-between" as const,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 4,
};

export default function TabsLayout() {
  const { data: profile, isLoading } = useProfile();
  const router = useRouter();
  const pathname = usePathname();

  const insets = useSafeAreaInsets();

  const dynamicTabBarStyle = useMemo(
    () => ({ ...tabBarStyle, bottom: insets.bottom }),
    [insets.bottom],
  );

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
    <SafeAreaView className="flex-1 bg-white/60" edges={["top"]}>
      <Tabs>
        <Animated.View
          key={pathname}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          className="flex-1"
        >
          <TabSlot />
        </Animated.View>
        <TabList asChild={true}>
          <View
            className="absolute flex-row items-center self-center rounded-full bg-white/90 p-2"
            style={dynamicTabBarStyle}
          >
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              const Icon = tab.icon;

              return (
                <TabTrigger
                  key={tab.name}
                  name={tab.name}
                  href={tab.href}
                  accessibilityLabel={tab.name}
                >
                  <View
                    className={`items-center justify-center rounded-full p-4 ${isActive ? "bg-zinc-100" : ""}`}
                  >
                    <Icon
                      color={isActive ? "#000000" : "#9ca3af"}
                      size={20}
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                  </View>
                </TabTrigger>
              );
            })}
          </View>
        </TabList>
      </Tabs>
    </SafeAreaView>
  );
}
