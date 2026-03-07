import { View } from "react-native";

import { LinkListTabs } from "@/src/features/links/screens";
import { useProfile } from "@/src/features/users";
import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";
import { WeekCalendarWidget } from "@/src/shared/components/WeekCalendarWidget";
import { formatDate } from "@/src/shared/utils/timezone";

export default function Home() {
  const { data: profile } = useProfile();

  return (
    <ScreenContainer
      headerTitle={`Hi, ${profile?.username} 👋`}
      subtitle={formatDate(new Date(), "long", "en-US")}
      topComponent={true}
      scrollable={false}
      centerContent={false}
      noPaddingBottom={true}
    >
      <View className="flex-1 flex-col gap-4 pt-20">
        <WeekCalendarWidget />
        <LinkListTabs />
      </View>
    </ScreenContainer>
  );
}
