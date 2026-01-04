import { useLocalSearchParams } from "expo-router";

import { LinkDetailScreen } from "@/src/features/links/screens";
import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";

export default function LinkDetail() {
  const { id } = useLocalSearchParams();
  return (
    <ScreenContainer
      scrollable={true}
      noPaddingBottom
      centerContent={false}
      topComponent={false}
      headerTitle="Swipes"
    >
      <LinkDetailScreen linkId={id as string} />
    </ScreenContainer>
  );
}
