import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";

import type { Session, User } from "@supabase/supabase-js";

import { useAuthSession } from "../hooks/useAuthSession";
import type { AuthState } from "../types/auth.types";

/**
 * 認証コンテキストの型定義
 */
export interface AuthContextValue {
  /** 現在のセッション */
  session: Session | null;
  /** 認証状態 */
  authState: AuthState;
  /** 現在のユーザー（セッションが存在する場合） */
  user: User | null;
  /** 認証済みかどうか */
  isAuthenticated: boolean;
  /** ロード中かどうか */
  isLoading: boolean;
}

/**
 * 認証コンテキスト
 *
 * アプリケーション全体で認証状態を共有するためのコンテキスト。
 * AuthProviderでラップされたコンポーネントツリー内でのみ使用可能。
 */
const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * 認証プロバイダー
 *
 * Supabaseの認証状態を監視し、アプリケーション全体で認証情報を提供します。
 * useAuthSession hookを内部で使用し、認証状態の変更をリアルタイムで追跡します。
 *
 * @example
 * ```tsx
 * // app/_layout.tsx
 * <UIProviders>
 *   <AppProviders>
 *     <AuthProvider>
 *       <Stack>...</Stack>
 *     </AuthProvider>
 *   </AppProviders>
 * </UIProviders>
 * ```
 *
 * ## 機能
 * - Supabase認証状態のリアルタイム監視
 * - セッション情報の一元管理
 * - 認証状態（loading/authenticated/unauthenticated）の提供
 * - ユーザー情報へのグローバルアクセス
 *
 * ## パフォーマンス最適化
 * - useAuthSession を1回だけ呼び出し（複数コンポーネントでの重複購読を防止）
 * - useMemo でコンテキスト値をメモ化
 * - 状態が変更された時のみ再レンダリング
 */
export function AuthProvider({ children }: PropsWithChildren) {
  const authSession = useAuthSession();

  // コンテキスト値をメモ化してパフォーマンスを最適化
  const value = useMemo<AuthContextValue>(
    () => ({
      session: authSession.session,
      authState: authSession.authState,
      user: authSession.user,
      isAuthenticated: authSession.isAuthenticated,
      isLoading: authSession.isLoading,
    }),
    [
      authSession.session,
      authSession.authState,
      authSession.user,
      authSession.isAuthenticated,
      authSession.isLoading,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * 認証コンテキストを使用するためのカスタムフック
 *
 * AuthProviderでラップされたコンポーネント内で認証情報にアクセスします。
 *
 * @throws {Error} AuthProvider外で使用された場合
 * @returns {AuthContextValue} 認証コンテキストの値
 *
 * @example
 * ```tsx
 * function ProfileScreen() {
 *   const { user, isAuthenticated } = useAuth();
 *
 *   if (!isAuthenticated || !user) {
 *     return <LoginPrompt />;
 *   }
 *
 *   return <UserProfile userId={user.id} />;
 * }
 * ```
 *
 * @example
 * ```tsx
 * function Header() {
 *   const { user, isLoading } = useAuth();
 *
 *   if (isLoading) {
 *     return <HeaderSkeleton />;
 *   }
 *
 *   return (
 *     <View>
 *       <Text>Welcome, {user?.email}</Text>
 *     </View>
 *   );
 * }
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  // AuthProvider外で使用された場合のチェック
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  // 型ガード後、contextは確実にAuthContextValue型
  return context as AuthContextValue;
}
