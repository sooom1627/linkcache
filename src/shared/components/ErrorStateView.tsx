import { AlertCircle, RefreshCw } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { Text, TouchableOpacity, View } from "@/src/tw";

type ErrorStateViewProps = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function ErrorStateView({
  message,
  actionLabel,
  onAction,
}: ErrorStateViewProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="mb-6 rounded-full bg-red-50 p-6">
        <AlertCircle size={48} color="#f87171" strokeWidth={1.5} />
      </View>
      <Text className="mb-2 text-center text-lg font-semibold text-slate-800">
        {t("common.error_title")}
      </Text>
      <Text className="mb-8 text-center text-sm leading-5 text-slate-500">
        {message}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          className="flex-row items-center gap-2 rounded-full bg-slate-900 px-6 py-3 active:bg-slate-700"
          accessibilityRole="button"
        >
          <RefreshCw size={18} color="white" strokeWidth={2} />
          <Text className="font-semibold text-white">{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
