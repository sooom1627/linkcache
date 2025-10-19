import { Alert } from "react-native";

import { useQueryClient } from "@tanstack/react-query";

import { SetupProfileScreen } from "@/src/features/users";
import { userQueryKeys } from "@/src/features/users/constants/queryKeys";

/**
 * プロフィール初期設定画面のエントリーポイント
 * リダイレクト処理は(protected)/_layout.tsxが担当
 */
export default function InitialSetup() {
  const queryClient = useQueryClient();

  // 成功時のコールバック
  const handleSuccess = () => {
    // プロフィールキャッシュを無効化
    queryClient.invalidateQueries({ queryKey: userQueryKeys.profile() });
    Alert.alert("Success", "Profile created successfully!");
    // リダイレクトは(protected)/_layout.tsxが自動的に処理
  };

  // エラー時のコールバック
  const handleError = (error: Error) => {
    Alert.alert("Profile Setup Failed", error.message);
  };

  return <SetupProfileScreen onSuccess={handleSuccess} onError={handleError} />;
}
