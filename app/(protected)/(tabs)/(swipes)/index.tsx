import { View } from "react-native";

import { SwipeTriageScreen } from "@/src/features/links/screens";
import { LinkCreateFAB } from "@/src/shared/components/LinkCreateFAB";

export default function Swipes() {
  return (
    <View style={{ flex: 1 }}>
      <SwipeTriageScreen />
      <LinkCreateFAB />
    </View>
  );
}
