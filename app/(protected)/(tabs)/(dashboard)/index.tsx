import { ScrollView, Text } from "react-native";

import { LinkCreateFAB } from "@/src/shared/components/LinkCreateFAB";

export default function Dashboard() {
  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingHorizontal: 16, gap: 16, flexGrow: 1 }}
      >
        <Text style={{ textAlign: "center", color: "#6b7280", marginTop: 32 }}>
          This is the dashboard screen.
        </Text>
      </ScrollView>
      <LinkCreateFAB />
    </>
  );
}
