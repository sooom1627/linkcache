import { Alert } from "react-native";

import type { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "../../auth";
import { createProfile } from "../api";
import { userQueryKeys } from "../constants/queryKeys";
import type { CreateProfileRequest, UserProfile } from "../types/users.types";

/**
 * プロフィール作成用のカスタムフック
 *
 * プロフィール情報の作成とキャッシュ管理を行います。
 * 作成後はキャッシュに新しいプロフィールを設定します。
 *
 * @param options - コールバックオプション
 * @returns mutate関数と処理状態
 *
 * @example
 * ```tsx
 * const { mutate: createProfile, isPending } = useCreateProfile({
 *   onSuccess: () => {
 *     console.log('Profile created');
 *     router.replace('/(tabs)');
 *   },
 *   onError: (error) => {
 *     Alert.alert('Error', error.message);
 *   }
 * });
 *
 * // 使用時
 * createProfile({ user_id: 'john_doe', username: 'John Doe' });
 * ```
 */
export function useCreateProfile(options?: {
  onSuccess?: () => void;
  onError?: (error: PostgrestError) => void;
}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const handleCreateProfile = useMutation<
    UserProfile,
    PostgrestError,
    CreateProfileRequest
  >({
    mutationFn: (profile) => createProfile(user.id, profile),
    onSuccess: (data) => {
      // 作成されたプロフィールをキャッシュに設定
      queryClient.setQueryData(userQueryKeys.profile(), data);
      Alert.alert("Success", "Profile created successfully");
      options?.onSuccess?.();
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to create profile");
      console.error("Error creating profile", error);
      options?.onError?.(error);
    },
    onSettled: () => {
      // 成功・失敗に関わらず、最終的にクエリを無効化して最新データを取得
      queryClient.invalidateQueries({ queryKey: userQueryKeys.profile() });
    },
  });

  return handleCreateProfile;
}
