import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import { Plus } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { useProfile } from "@/src/features/users";
import { ScreenContainer } from "@/src/shared/components/layout/ScreenContainer";
import { useModal } from "@/src/shared/providers/ModalContext";

export default function Index() {
  const { data: profile, isLoading, error, refetch } = useProfile();
  const { t } = useTranslation();
  const { openModal } = useModal();

  if (isLoading) {
    return (
      <ScreenContainer scrollable={false}>
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer scrollable={false}>
        <Text className="text-center text-red-600">
          プロフィールの読み込みに失敗しました
        </Text>
        <TouchableOpacity
          className="mt-4 rounded-lg bg-blue-500 px-6 py-3"
          accessibilityRole="button"
          accessibilityLabel="プロフィールを再読み込み"
          onPress={() => {
            refetch();
          }}
        >
          <Text className="text-center font-semibold text-white">
            再読み込み
          </Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }
  return (
    <ScreenContainer headerTitle={`Hello, ${profile?.username}`}>
      <Text className="text-center text-gray-600">You are logged in!</Text>
      <Text className="text-center text-gray-600">
        @{profile?.user_id || "..."} / {profile?.username || "..."}
      </Text>
      <Text>{t("welcome_message")}</Text>

      {/* リンク追加ボタン（仮） */}
      <TouchableOpacity
        className="flex-row items-center gap-2 rounded-lg bg-blue-500 px-6 py-3"
        accessibilityRole="button"
        accessibilityLabel={t("links.create.add_button")}
        onPress={() => openModal("linkCreate")}
      >
        <Plus size={20} color="white" />
        <Text className="font-semibold text-white">
          {t("links.create.add_button")}
        </Text>
      </TouchableOpacity>

      {Array.from({ length: 25 }).map((_, index) => (
        <View key={index} className="mb-4">
          <Text className="text-lg font-bold">Swipe {index + 1}</Text>
          <Text className="text-sm text-gray-500">Description {index + 1}</Text>
        </View>
      ))}
    </ScreenContainer>
  );
}
