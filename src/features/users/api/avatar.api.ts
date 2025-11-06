import type { PostgrestError } from "@supabase/supabase-js";

import { supabase } from "@/src/shared/lib/supabase";

/**
 * PostgrestErrorと互換性のあるカスタムエラーを作成
 */
function createPostgrestError(
  message: string,
  code: string = "PGRST301",
): PostgrestError {
  const error: PostgrestError = {
    name: "PostgrestError",
    message,
    details: message,
    hint: "",
    code,
  };
  return error;
}

/**
 * アバター画像をアップロード
 * @param userId - 認証されたユーザーのID
 * @param filePath - Storageでのファイルパス（例: {userId}/avatar.jpg）
 * @param fileData - アップロードするファイルデータ（ArrayBuffer）
 * @param mimeType - ファイルのMIMEタイプ
 * @returns アップロードされた画像のPublic URL
 * @throws {PostgrestError} アップロードまたはDB更新エラーが発生した場合
 */
export async function uploadAvatar(
  userId: string,
  filePath: string,
  fileData: ArrayBuffer,
  mimeType: string,
): Promise<{ avatarUrl: string }> {
  if (!userId) {
    throw createPostgrestError("User not authenticated", "AUTH001");
  }

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, fileData, {
      contentType: mimeType,
      upsert: true,
    });

  if (uploadError) {
    throw createPostgrestError(
      `Failed to upload avatar: ${uploadError.message}`,
      "STORAGE002",
    );
  }

  if (!uploadData) {
    throw createPostgrestError("Upload failed: No data returned", "STORAGE003");
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from("users")
    .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (updateError) {
    throw updateError;
  }

  return { avatarUrl: publicUrl };
}

/**
 * アバター画像を削除
 * @param userId - 認証されたユーザーのID
 * @throws {PostgrestError} 削除またはDB更新エラーが発生した場合
 */
export async function deleteAvatar(userId: string): Promise<void> {
  if (!userId) {
    throw createPostgrestError("User not authenticated", "AUTH001");
  }

  try {
    // Storageから全ての画像を削除（拡張子が変わる可能性を考慮）
    const extensions = ["jpg", "jpeg", "png", "webp"];
    const filePaths = extensions.map((ext) => `${userId}/avatar.${ext}`);

    // 削除実行（エラーは無視 - ファイルが存在しない場合がある）
    try {
      await supabase.storage.from("avatars").remove(filePaths);
    } catch {
      // ファイルが存在しない場合のエラーは無視
    }

    // usersテーブルのavatar_urlをnullに更新
    const { error: updateError } = await supabase
      .from("users")
      .update({ avatar_url: null, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (updateError) {
      throw updateError;
    }
  } catch (error) {
    if ((error as PostgrestError).code) {
      throw error;
    }
    throw createPostgrestError(
      `Unexpected error during avatar deletion: ${(error as Error).message}`,
      "STORAGE005",
    );
  }
}
