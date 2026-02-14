
import { LinkListScreen } from "@/src/features/links";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function Links() {
  return (
    <>
    <Stack.Screen
      options={{
        title: "Links",
      }}
    />
    <View style={{ flex: 1 }}>
      <LinkListScreen />
    </View>
  </>
  );
}
