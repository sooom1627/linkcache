import { Text, TouchableOpacity, View } from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { ArrowLeft } from "lucide-react-native";

import { Avatar } from "@/src/features/users/components/user/Avatar";
import { useProfile } from "@/src/features/users/hooks";
import { useModal } from "@/src/shared/providers";
import { formatDate } from "@/src/shared/utils/timezone";

export interface HeaderProps {
  title: string;
  topComponent?: boolean;
}
const HEADER_HEIGHT = 64;

export default function Header({
  title = "Hello, User",
  topComponent = true,
}: HeaderProps) {
  const { openModal } = useModal();
  const { data: profile } = useProfile();

  return (
    <View
      className="absolute inset-x-0 top-0 z-50"
      style={{ height: HEADER_HEIGHT }}
    >
      <LinearGradient
        colors={[
          "rgba(255, 255, 255, 1)",
          "rgba(255, 255, 255, 0.9)",
          "rgba(255, 255, 255, 0.0)",
        ]}
        locations={[0, 0.6, 1]}
        style={{ height: HEADER_HEIGHT }}
      >
        {topComponent ? (
          <View className="flex-row items-center justify-start gap-2 px-4 py-2">
            <Avatar
              avatarUrl={profile?.avatar_url}
              updatedAt={profile?.updated_at}
              onPress={() => openModal("setting")}
              size="medium"
              accessibilityLabel="Open settings"
            />
            <View>
              {title.includes("Hello") && (
                <Text className="text-base text-slate-500">
                  {formatDate(new Date(), "medium")}
                </Text>
              )}
              <Text className="text-xl font-bold text-slate-700">{title}</Text>
            </View>
          </View>
        ) : (
          <View className="flex-row items-center justify-start gap-4 px-4 py-2">
            <TouchableOpacity
              onPress={() => router.back()}
              className="rounded-full bg-slate-200 p-4"
              hitSlop={10}
              activeOpacity={0.8}
              accessibilityLabel="Back"
              accessibilityRole="button"
              accessibilityHint="Go back to the previous screen"
            >
              <ArrowLeft size={16} color="black" />
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}
