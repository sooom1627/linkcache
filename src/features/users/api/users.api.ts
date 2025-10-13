import { supabase } from "@/src/shared/utils/supabase";

import type { CreateProfileRequest, UserProfile } from "../types/users.types";

/**
 * プロフィールを作成
 * @param profile - 作成するプロフィール情報
 * @returns 作成されたプロフィール
 * @throws {PostgrestError} データベースエラーが発生した場合
 */
export async function createProfile(
  profile: CreateProfileRequest,
): Promise<UserProfile> {
  // 現在認証されているユーザーを取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // プロフィールをINSERT
  const { data, error } = await supabase
    .from("users")
    .insert({
      id: user.id,
      user_id: profile.user_id,
      username: profile.username,
    })
    .select()
    .single<UserProfile>();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Failed to create profile");
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
