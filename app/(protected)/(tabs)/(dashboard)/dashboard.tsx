import { Text } from "react-native";

import { DashboardOverview } from "@/src/features/links/screens";
import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";

const MOCK_INBOX_COUNT = 12;
const MOCK_READ_COUNT = 8;
const MOCK_ALL_LINKS_COUNT = 142;

export default function Dashboard() {
  return (
    <ScreenContainer headerTitle="Dashboard">
      <Text className="mb-8 text-center text-gray-600">
        This is the dashboard screen.
      </Text>
      <DashboardOverview
        inboxCount={MOCK_INBOX_COUNT}
        readCount={MOCK_READ_COUNT}
        allLinksCount={MOCK_ALL_LINKS_COUNT}
      />
    </ScreenContainer>
  );
}
