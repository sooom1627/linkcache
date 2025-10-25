import type { PostgrestError } from "@supabase/supabase-js";

import { supabase } from "@/src/shared/utils/supabase";

import type { UpdateProfileRequest, UserProfile } from "../types/users.types";

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
 * プロフィールを更新
 * @param userId - 認証されたユーザーのID
 * @param profile - 更新するプロフィール情報
 * @returns 更新されたプロフィール
 * @throws {PostgrestError} データベースエラーが発生した場合
 */
export async function updateProfile(
  userId: string | null,
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
 * @param excludeUserId - 除外するuser_id（更新時に現在のuser_idを除外する場合に使用）
 * @returns 利用可能な場合はtrue、既に使用されている場合はfalse
 * @throws {PostgrestError} データベースエラーが発生した場合
 */
export async function checkUserIdAvailability(
  userId: string,
  excludeUserId?: string,
): Promise<boolean> {
  let query = supabase.from("users").select("user_id").eq("user_id", userId);

  // 現在のuser_idを除外（更新時）
  if (excludeUserId) {
    query = query.neq("user_id", excludeUserId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw error;
  }

  // dataがnullなら利用可能
  return data === null;
}
