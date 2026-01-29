import { LinkListScreen } from "@/src/features/links";
import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";

export default function Links() {
  return (
    <ScreenContainer
      scrollable={false}
      noPaddingBottom={true}
      centerContent={false}
      topComponent={false}
    >
      <LinkListScreen />
    </ScreenContainer>
  );
}
