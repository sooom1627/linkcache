import { ScrollView, View } from "react-native";

import Stack from "expo-router/stack";

import { DashboardOverview, LinkListTabs } from "@/src/features/links/screens";
import { useProfile } from "@/src/features/users";
import { LinkCreateFAB } from "@/src/shared/components/LinkCreateFAB";

const MOCK_INBOX_COUNT = 12;
const MOCK_READ_COUNT = 8;
const MOCK_ALL_LINKS_COUNT = 142;

export default function Home() {
  const { data: profile } = useProfile();

  return (
    <>
      <Stack.Screen
        options={{
          title: `Hi, ${profile?.username ?? "User"} 👋`,
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
      >
        <View style={{ paddingTop: 8 }}>
          <DashboardOverview
            inboxCount={MOCK_INBOX_COUNT}
            readCount={MOCK_READ_COUNT}
            allLinksCount={MOCK_ALL_LINKS_COUNT}
          />
        </View>
        <LinkListTabs />
      </ScrollView>
      <LinkCreateFAB />
    </>
  );
}
