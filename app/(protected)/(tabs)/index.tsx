import { DashboardOverview, LinkListTabs } from "@/src/features/links/screens";
import type { UserLink } from "@/src/features/links/types/linkList.types";
import { useProfile } from "@/src/features/users";
import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";
import { formatDate } from "@/src/shared/utils/timezone";

// Mock Data
const MOCK_LINKS: UserLink[] = [
  {
    status_id: "1",
    user_id: "u1",
    status: "keep",
    triaged_at: new Date().toISOString(),
    read_at: null,
    saved_at: new Date().toISOString(),
    link_id: "l1",
    url: "https://reactnative.dev/blog/2024/10/24/the-new-architecture-is-here",
    title: "The New Architecture is Here",
    description: "React Native's new architecture is now default.",
    image_url: null,
    favicon_url: null,
    site_name: "React Native",
    link_created_at: new Date().toISOString(),
  },
  {
    status_id: "2",
    user_id: "u1",
    status: "inbox", // This one is latest but not kept
    triaged_at: null,
    read_at: null,
    saved_at: new Date(Date.now() - 3600000).toISOString(),
    link_id: "l2",
    url: "https://supabase.com/blog/supabase-auth-sso-pkce",
    title: "Supabase Auth Updates",
    description: "New features in Supabase Authentication.",
    image_url: null,
    favicon_url: null,
    site_name: "Supabase",
    link_created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    status_id: "3",
    user_id: "u1",
    status: "keep",
    triaged_at: new Date(Date.now() - 86400000).toISOString(),
    read_at: null,
    saved_at: new Date(Date.now() - 86400000).toISOString(),
    link_id: "l3",
    url: "https://tkdodo.eu/blog/react-query-and-forms",
    title: "React Query and Forms",
    description: "How to handle forms with server state.",
    image_url: null,
    favicon_url: null,
    site_name: "TkDodo",
    link_created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    status_id: "4",
    user_id: "u1",
    status: "archived",
    triaged_at: new Date(Date.now() - 172800000).toISOString(),
    read_at: new Date().toISOString(),
    saved_at: new Date(Date.now() - 172800000).toISOString(),
    link_id: "l4",
    url: "https://nativewind.dev/",
    title: "NativeWind v4",
    description: "Tailwind CSS for React Native.",
    image_url: null,
    favicon_url: null,
    site_name: "NativeWind",
    link_created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

const MOCK_INBOX_COUNT = 12;
const MOCK_READ_COUNT = 8;
const MOCK_ALL_LINKS_COUNT = 142;

export default function Home() {
  const { data: profile } = useProfile();

  return (
    <ScreenContainer
      headerTitle={`Hi, ${profile?.username}👋`}
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
      <LinkListTabs links={MOCK_LINKS} />
    </ScreenContainer>
  );
}
