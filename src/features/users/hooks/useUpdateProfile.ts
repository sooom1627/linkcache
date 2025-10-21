import { Alert } from "react-native";

import type { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "../../auth";
import { updateProfile } from "../api";
import { userQueryKeys } from "../constants/queryKeys";
import type { UpdateProfileRequest, UserProfile } from "../types";

/**
 * プロフィール更新用のカスタムフック
 *
 * プロフィール情報の更新とキャッシュ管理を行います。
 * フォーム状態は含まず、API処理のみを提供します。
 *
 * @param options - コールバックオプション
 * @returns mutate関数と処理状態
 *
 * @example
 * ```tsx
 * const { mutate: updateProfile, isPending } = useUpdateProfile({
 *   onSuccess: () => {
 *     console.log('Profile updated');
 *   },
 *   onError: (error) => {
 *     Alert.alert('Error', error.message);
 *   }
 * });
 *
 * // 使用時
 * updateProfile({ user_id: 'john_doe', username: 'John Doe' });
 * ```
 */
export function useUpdateProfile(options?: {
  onSuccess?: () => void;
  onError?: (error: PostgrestError) => void;
}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const handleUpdateProfile = useMutation<
    UserProfile,
    PostgrestError,
    UpdateProfileRequest,
    { previousProfile: UserProfile | undefined } // contextの型定義
  >({
    mutationFn: (profile) => updateProfile(user.id, profile),
    onSuccess: (data) => {
      queryClient.setQueryData(userQueryKeys.profile(), data);
      Alert.alert("Success", "Profile updated successfully");
      options?.onSuccess?.();
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to update profile");
      console.error("Error updating profile", error);
      options?.onError?.(error);
    },
    onSettled: () => {
      // 成功・失敗に関わらず、最終的にクエリを無効化して最新データを取得
      queryClient.invalidateQueries({ queryKey: userQueryKeys.profile() });
    },
  });

  return handleUpdateProfile;
}
