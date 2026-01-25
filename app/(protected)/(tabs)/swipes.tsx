
import { SwipeTriageScreen } from "@/src/features/links/screens";
import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";

export default function Swipes() {
  return (
    <ScreenContainer
      scrollable={false}
      headerTitle="Swipes"
      noPaddingBottom={true}
    >
      <SwipeTriageScreen />
    </ScreenContainer>
  );
}
