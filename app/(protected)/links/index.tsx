import { View } from "react-native";

import { Stack } from "expo-router";

import { LinkListScreen } from "@/src/features/links";

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
