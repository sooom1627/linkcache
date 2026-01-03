import { LinkListScreen } from "@/src/features/links";
import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";

export default function LinkList() {
  return (
    <ScreenContainer
      scrollable={false}
      centerContent={false}
      noPaddingBottom
      headerTitle="Link List"
    >
      <LinkListScreen />
    </ScreenContainer>
  );
}
