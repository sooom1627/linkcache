import { DashboardOverview } from "@/src/features/links/screens";
import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";

export default function Dashboard() {
  return (
    <ScreenContainer headerTitle="Dashboard">
      <DashboardOverview />
    </ScreenContainer>
  );
}
