import { Alert } from "react-native";

import type { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "../../auth";
import { uploadAvatar } from "../api";
import { userQueryKeys } from "../constants/queryKeys";
import type { UserProfile } from "../types/users.types";

/**
 * MIMEタイプから拡張子を取得
 */
function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return mimeToExt[mimeType] || "jpg";
}

/**
 * ファイルURIをArrayBufferに変換
 * @param fileUri - ローカルファイルURI
 * @returns ArrayBuffer
 */
async function convertFileToArrayBuffer(fileUri: string): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    // fetchを使ってBlobを取得
    fetch(fileUri)
      .then((response) => response.blob())
      .then((blob) => {
        // FileReaderを使ってBlobをArrayBufferに変換
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result instanceof ArrayBuffer) {
            resolve(reader.result);
          } else {
            reject(new Error("Failed to convert blob to ArrayBuffer"));
          }
        };
        reader.onerror = () => {
          reject(new Error("FileReader error"));
        };
        reader.readAsArrayBuffer(blob);
      })
      .catch(reject);
  });
}

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
 * ファイル変換処理（fileUri → ArrayBuffer）を含み、
 * Supabase Storageへのアップロードとプロフィール更新を行います。
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
  onSuccess?: (data: { avatarUrl: string }) => void;
  onError?: (error: PostgrestError) => void;
}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const handleUploadAvatar = useMutation<
    { avatarUrl: string },
    PostgrestError,
    UploadAvatarRequest
  >({
    mutationFn: async ({ fileUri, mimeType }) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // ファイルパスを生成
      const extension = getExtensionFromMimeType(mimeType);
      const filePath = `${user.id}/avatar.${extension}`;

      // ファイルをArrayBufferに変換
      const fileData = await convertFileToArrayBuffer(fileUri);

      // APIを呼び出し
      return uploadAvatar(user.id, filePath, fileData, mimeType);
    },
    onSuccess: async (data) => {
      // 既存のプロフィールデータを取得
      const currentProfile = queryClient.getQueryData<UserProfile | null>(
        userQueryKeys.profile(),
      );

      // キャッシュを即座に更新（楽観的更新）
      if (currentProfile) {
        const updatedProfile: UserProfile = {
          ...currentProfile,
          avatar_url: data.avatarUrl,
          updated_at: new Date().toISOString(),
        };
        queryClient.setQueryData(userQueryKeys.profile(), updatedProfile);
      }

      // バックグラウンドでサーバーと同期
      void queryClient.invalidateQueries({
        queryKey: userQueryKeys.profile(),
        refetchType: "none",
      });

      Alert.alert("Success", "Avatar uploaded successfully");
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      Alert.alert(
        "Upload Failed",
        "Could not upload avatar. Please try again.",
      );
      console.error("Error uploading avatar:", error);
      options?.onError?.(error);
    },
  });

  return handleUploadAvatar;
}
