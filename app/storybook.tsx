import { useCallback } from "react";

import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";

import { useRouter } from "expo-router";

import StorybookUI from "@/.storybook";

export default function StorybookScreen() {
  const router = useRouter();

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between border-b border-slate-200 px-4 py-2">
        <TouchableOpacity onPress={handleGoBack}>
          <Text className="text-sm text-accent">← アプリに戻る</Text>
        </TouchableOpacity>
        <Text className="text-sm font-medium text-slate-700">Storybook</Text>
        <View className="w-16" />
      </View>
      <StorybookUI />
    </SafeAreaView>
  );
}
