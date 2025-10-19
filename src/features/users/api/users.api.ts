import type { PostgrestError } from "@supabase/supabase-js";

import { supabase } from "@/src/shared/utils/supabase";

import type {
  CreateProfileRequest,
  UpdateProfileRequest,
  UserProfile,
} from "../types/users.types";

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
 * プロフィールを作成
 * @param userId - 認証されたユーザーのID
 * @param profile - 作成するプロフィール情報
 * @returns 作成されたプロフィール
 * @throws {PostgrestError} データベースエラーが発生した場合
 */
export async function createProfile(
  userId: string,
  profile: CreateProfileRequest,
): Promise<UserProfile> {
  // プロフィールをINSERT
  const { data, error } = await supabase
    .from("users")
    .insert({
      id: userId,
      user_id: profile.user_id,
      username: profile.username,
    })
    .select()
    .single<UserProfile>();

  if (error) {
    throw error;
  }

  if (!data) {
    throw createPostgrestError("Failed to create profile", "PGRST116");
  }

  return data;
}

/**
 * プロフィールを更新
 * @param userId - 認証されたユーザーのID
 * @param profile - 更新するプロフィール情報
 * @returns 更新されたプロフィール
 * @throws {PostgrestError} データベースエラーが発生した場合
 */
export async function updateProfile(
  userId: string,
  profile: UpdateProfileRequest,
): Promise<UserProfile> {
  const { user_id, username } = profile;

  if (!userId) {
    throw createPostgrestError("User not authenticated", "AUTH001");
  }

  if (!user_id || !username) {
    throw createPostgrestError("User ID and username are required", "PGRST116");
  }

  const { data, error } = await supabase
    .from("users")
    .update({ user_id, username, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single<UserProfile>();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * 現在のユーザーのプロフィールを取得
 * @returns プロフィール情報（存在しない場合はnull）
 * @throws {PostgrestError} データベースエラーが発生した場合
 */
export async function getMyProfile(): Promise<UserProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<UserProfile>();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * user_idの重複チェック
 * @param userId - チェックするuser_id
 * @returns 利用可能な場合はtrue、既に使用されている場合はfalse
 * @throws {PostgrestError} データベースエラーが発生した場合
 */
export async function checkUserIdAvailability(
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  // dataがnullなら利用可能
  return data === null;
}
