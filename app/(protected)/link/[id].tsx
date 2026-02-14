import { ScrollView, Text, View } from "react-native";

import { useLocalSearchParams } from "expo-router";
import Stack from "expo-router/stack";

import { useTranslation } from "react-i18next";

import { LinkDetailScreen } from "@/src/features/links/screens";

export default function LinkDetail() {
  const { id } = useLocalSearchParams();
  const { t } = useTranslation();

  // 型ガード: idが存在しない、または配列の場合はエラー画面を表示
  if (!id || Array.isArray(id)) {
    return (
      <>
        <Stack.Screen options={{ title: t("links.detail.error") }} />
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
        >
          <Text style={{ textAlign: "center", color: "#ef4444", fontSize: 16 }}>
            {t("links.detail.error")}
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: t("links.detail.title", { defaultValue: "Details" }),
          headerTransparent: true,
          headerShadowVisible: false,
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <LinkDetailScreen linkId={id} />
      </ScrollView>
    </>
  );
}
