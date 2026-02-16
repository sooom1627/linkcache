import { DashboardOverview, LinkListTabs } from "@/src/features/links/screens";
import { CollectionsLane } from "@/src/features/links/screens/CollectionsLane";
import { useDashboardStats } from "@/src/features/links/hooks/useDashboardStats";
import { useProfile } from "@/src/features/users";
import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";
import { formatDate } from "@/src/shared/utils/timezone";

export default function Home() {
  const { data: profile } = useProfile();
  const { inboxCount, allLinksCount, isLoading } = useDashboardStats();

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
        inboxCount={inboxCount}
        readCount={0}
        allLinksCount={allLinksCount}
        isLoading={isLoading}
      />
      <CollectionsLane />
      <LinkListTabs />
    </ScreenContainer>
  );
}
