import type { AuthError, Session, User } from "@supabase/supabase-js";

/**
 * 認証APIのレスポンス型
 */
export interface AuthResponse {
  session: Session | null;
  user: User | null;
}

/**
 * 認証APIのエラーレスポンス型
 */
export interface AuthErrorResponse {
  error: AuthError | null;
}

/**
 * サインイン用のクレデンシャル
 */
export interface SignInCredentials {
  email: string;
  password: string;
}

/**
 * サインアップ用のクレデンシャル
 */
export interface SignUpCredentials {
  email: string;
  password: string;
}

/**
 * OAuth プロバイダー型
 */
export type OAuthProvider = "google" | "github" | "apple";

/**
 * 認証状態
 */
export type AuthState = "authenticated" | "unauthenticated" | "loading";
