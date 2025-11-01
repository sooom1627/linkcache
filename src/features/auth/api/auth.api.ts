import { supabase } from "@/src/shared/lib/supabase";

import type {
  AuthResponse,
  OAuthProvider,
  SignInCredentials,
  SignUpCredentials,
} from "../types/auth.types";

/**
 * メールアドレスとパスワードでサインイン
 * @param credentials - サインイン用のクレデンシャル
 * @returns 認証レスポンス
 * @throws {AuthError} 認証エラーが発生した場合
 */
export async function signInWithPassword(
  credentials: SignInCredentials,
): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    throw error;
  }

  return {
    session: data.session,
    user: data.user,
  };
}

/**
 * メールアドレスとパスワードで新規アカウント作成
 * @param credentials - サインアップ用のクレデンシャル
 * @returns 認証レスポンス
 * @throws {AuthError} 認証エラーが発生した場合
 */
export async function signUpWithPassword(
  credentials: SignUpCredentials,
): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    throw error;
  }

  return {
    session: data.session,
    user: data.user,
  };
}

/**
 * サインアウト
 * @throws {AuthError} サインアウトエラーが発生した場合
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

/**
 * OAuthプロバイダーでサインイン
 * @param provider - OAuthプロバイダー名
 * @throws {AuthError} 認証エラーが発生した場合
 */
export async function signInWithOAuth(provider: OAuthProvider): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
  });

  if (error) {
    throw error;
  }
}
