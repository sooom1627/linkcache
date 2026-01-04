import { DashboardOverview, LinkListTabs } from "@/src/features/links/screens";
import { useProfile } from "@/src/features/users";
import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";
import { formatDate } from "@/src/shared/utils/timezone";

const MOCK_INBOX_COUNT = 12;
const MOCK_READ_COUNT = 8;
const MOCK_ALL_LINKS_COUNT = 142;

export default function Home() {
  const { data: profile } = useProfile();

  return (
    <ScreenContainer
      headerTitle={`Hi, ${profile?.username} 👋`}
      subtitle={formatDate(new Date(), "long", "en-US")}
      topComponent={true}
      scrollable={true}
      centerContent={false}
      noPaddingBottom={false}
    >
      <DashboardOverview
        inboxCount={MOCK_INBOX_COUNT}
        readCount={MOCK_READ_COUNT}
        allLinksCount={MOCK_ALL_LINKS_COUNT}
      />
      <LinkListTabs />
    </ScreenContainer>
  );
}
