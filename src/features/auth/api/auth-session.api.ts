import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/src/shared/lib/supabase";

/**
 * 現在のセッションを取得
 * @returns 現在のセッション（存在しない場合はnull）
 */
export async function getSession(): Promise<Session | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}

/**
 * 現在のユーザー情報を取得
 * @returns 現在のユーザー（存在しない場合はnull）
 */
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

/**
 * セッションの手動リフレッシュ
 * @returns 新しいセッション
 * @throws {AuthError} リフレッシュエラーが発生した場合
 */
export async function refreshSession(): Promise<Session | null> {
  const {
    data: { session },
    error,
  } = await supabase.auth.refreshSession();

  if (error) {
    throw error;
  }

  return session;
}
