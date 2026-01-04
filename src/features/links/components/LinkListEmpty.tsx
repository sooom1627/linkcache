import { Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useTranslation } from "react-i18next";

/**
 * リンク一覧の空状態コンポーネント
 *
 * リンクが1件も保存されていない場合に表示
 */
export function LinkListEmpty() {
  const { t } = useTranslation();

  return (
    <View className="mt-16 flex-1 items-center justify-center px-8 py-16">
      <View className="mb-4 rounded-full bg-gray-100 p-4">
        <Ionicons name="link-outline" size={48} color="#9CA3AF" />
      </View>
      <Text className="mb-2 text-center text-lg font-semibold text-gray-700">
        {t("links.list.empty_title", "No links yet")}
      </Text>
      <Text className="text-center text-sm text-gray-500">
        {t(
          "links.list.empty_description",
          "Start saving links to see them here",
        )}
      </Text>
    </View>
  );
}
