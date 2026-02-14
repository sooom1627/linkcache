import { ActivityIndicator } from "react-native";

import { colors } from "@/src/shared/constants/colors";
import { View } from "@/src/tw";

interface LinkListLoadingFooterProps {
  isLoading: boolean;
}

/**
 * リンク一覧のローディングフッター
 *
 * 無限スクロールで次ページ読み込み中に表示するスピナー
 */
export function LinkListLoadingFooter({
  isLoading,
}: LinkListLoadingFooterProps) {
  if (!isLoading) {
    return null;
  }

  return (
    <View className="items-center justify-center py-6">
      <ActivityIndicator size="small" color={colors.icon} />
    </View>
  );
}
