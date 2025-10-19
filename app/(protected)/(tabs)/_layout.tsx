import { useEffect } from "react";

import { View } from "react-native";

import { usePathname, useRouter } from "expo-router";
import { TabList, Tabs, TabSlot, TabTrigger } from "expo-router/ui";

import { ChartNoAxesCombined, House, Layers2, List } from "lucide-react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { useProfile } from "@/src/features/users";

const tabs = [
  { name: "index", href: "/" as const, icon: House },
  { name: "swipes", href: "/swipes" as const, icon: Layers2 },
  { name: "link-list", href: "/link-list" as const, icon: List },
  { name: "dashboard", href: "/dashboard" as const, icon: ChartNoAxesCombined },
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
        <TabList asChild={true} className="absolute inset-x-12 bottom-0">
          <View
            className="w-fit flex-row items-center justify-around gap-4 self-center rounded-full bg-white/95 p-2"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              const Icon = tab.icon;

              return (
                <TabTrigger
                  key={tab.name}
                  name={tab.name}
                  href={tab.href}
                  className="flex-1"
                >
                  <View
                    className={`items-center justify-center rounded-full px-6 py-4 ${isActive ? "bg-zinc-100" : ""}`}
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
