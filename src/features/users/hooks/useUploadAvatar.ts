import { Alert } from "react-native";

import type { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  convertFileToArrayBuffer,
  getExtensionFromMimeType,
} from "@/src/shared/utils/file";

import { useAuth } from "../../auth";
import { uploadAvatar } from "../api";
import { userQueryKeys } from "../constants/queryKeys";
import type { UserProfile } from "../types/users.types";

/**
 * アバター画像アップロード用のリクエスト型
 */
export interface UploadAvatarRequest {
  fileUri: string;
  mimeType: string;
}

/**
 * アバター画像アップロード用のカスタムフック
 *
 * Supabase Storageへのアップロードとプロフィール更新を行います。
 * ファイル変換処理は共通ユーティリティ（@/shared/utils/file）を使用します。
 *
 * @param options - コールバックオプション
 * @returns mutate関数と処理状態
 *
 * @example
 * ```tsx
 * const { mutate: uploadAvatar, isPending } = useUploadAvatar({
 *   onSuccess: (data) => {
 *     console.log('Avatar uploaded:', data.avatarUrl);
 *   },
 *   onError: (error) => {
 *     Alert.alert('Error', error.message);
 *   }
 * });
 *
 * // 使用時
 * uploadAvatar({
 *   fileUri: 'file:///path/to/image.jpg',
 *   mimeType: 'image/jpeg'
 * });
 * ```
 */
export function useUploadAvatar(options?: {
  onSuccess?: () => void;
  onError?: () => void;
}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const handleUploadAvatar = useMutation<
    { avatarUrl: string },
    PostgrestError,
    UploadAvatarRequest
  >({
    mutationFn: async ({ fileUri, mimeType }) => {
      const extension = getExtensionFromMimeType(mimeType);
      const filePath = `${user?.id}/avatar.${extension}`;

      const fileData = await convertFileToArrayBuffer(fileUri);

      return uploadAvatar(user?.id ?? "", filePath, fileData, mimeType);
    },
    onSuccess: async (data) => {
      const currentProfile = queryClient.getQueryData<UserProfile | null>(
        userQueryKeys.profile(),
      );

      if (currentProfile) {
        const updatedProfile: UserProfile = {
          ...currentProfile,
          avatar_url: data.avatarUrl,
          updated_at: new Date().toISOString(),
        };
        queryClient.setQueryData(userQueryKeys.profile(), updatedProfile);
      }

      Alert.alert("Success", "Avatar uploaded successfully");
      options?.onSuccess?.();
    },
    onError: (error) => {
      Alert.alert(
        "Upload Failed",
        "Could not upload avatar. Please try again.",
      );
      throw {
        message: "Failed to upload avatar",
        code: "PGRST116",
        details: error.message,
        hint: error.hint,
        name: "PostgrestError",
      } as unknown as PostgrestError;
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: userQueryKeys.profile(),
        refetchType: "none",
      });
    },
  });

  return handleUploadAvatar;
}
