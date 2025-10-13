import { useEffect, useState } from "react";

import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

import { supabase } from "@/src/shared/utils/supabase";

import { getSession } from "../api";
import type { AuthState } from "../types/auth.types";

/**
 * 認証セッション管理用のカスタムフック
 *
 * Supabaseの認証状態の変更を監視し、現在のセッション情報を提供します。
 * アプリの起動時に自動的にセッションを取得し、
 * サインイン/サインアウトなどの認証イベントを自動的に追跡します。
 *
 * @example
 * ```tsx
 * function App() {
 *   const { session, authState, user } = useAuthSession();
 *
 *   if (authState === 'loading') {
 *     return <LoadingScreen />;
 *   }
 *
 *   if (authState === 'authenticated' && user) {
 *     return <AuthenticatedApp user={user} />;
 *   }
 *
 *   return <LoginScreen />;
 * }
 * ```
 */
export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    // 初期セッションの取得
    getSession()
      .then((session) => {
        setSession(session);
        setAuthState(session ? "authenticated" : "unauthenticated");
      })
      .catch((error) => {
        console.error("Failed to get session:", error);
        setAuthState("unauthenticated");
      });

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setAuthState(session ? "authenticated" : "unauthenticated");
      },
    );

    // クリーンアップ
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    /** 現在のセッション */
    session,
    /** 認証状態 */
    authState,
    /** 現在のユーザー（セッションが存在する場合） */
    user: session?.user ?? null,
    /** 認証済みかどうか */
    isAuthenticated: authState === "authenticated",
    /** ロード中かどうか */
    isLoading: authState === "loading",
  };
}
