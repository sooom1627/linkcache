import { LinksOverViewScreen } from "@/src/features/links/screens/LinksOverViewScreen";
import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";

export default function LinkList() {
  return (
    <ScreenContainer
      scrollable={true}
      centerContent={false}
      noPaddingBottom
      headerTitle={"Links Overview"}
      subtitle={"Organize your links"}
    >
      <LinksOverViewScreen />
    </ScreenContainer>
  );
}
