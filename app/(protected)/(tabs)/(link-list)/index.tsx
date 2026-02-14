import { View } from "react-native";

import Stack from "expo-router/stack";

import { useTranslation } from "react-i18next";

import { LinkListScreen } from "@/src/features/links";
import { LinkCreateFAB } from "@/src/shared/components/LinkCreateFAB";

export default function LinkList() {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen
        options={{
          title: t("links.header.title"),
        }}
      />
      <View style={{ flex: 1 }}>
        <LinkListScreen />
        <LinkCreateFAB />
      </View>
    </>
  );
}
