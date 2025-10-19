/**
 * Auth Feature Module
 *
 * 認証機能を提供するモジュール
 *
 * ## 構成
 * - **API**: Supabase Authとの通信を行う関数群
 * - **Hooks**: React Queryを使用した認証操作のカスタムフック
 * - **Context**: 認証状態をグローバルに管理するコンテキスト
 * - **Types**: 認証関連の型定義
 * - **Components**: 認証UIコンポーネント
 * - **Screens**: 認証画面コンポーネント
 *
 * ## 使用例
 *
 * ### サインイン
 * ```tsx
 * import { useSignIn } from '@/features/auth';
 *
 * function LoginScreen() {
 *   const { mutate: signIn, isPending } = useSignIn({
 *     onSuccess: (data) => {
 *       console.log('Signed in:', data.user);
 *     }
 *   });
 *
 *   const handleSubmit = (email: string, password: string) => {
 *     signIn({ email, password });
 *   };
 * }
 * ```
 *
 * ### 認証状態の使用（推奨）
 * ```tsx
 * import { useAuth } from '@/features/auth';
 *
 * function App() {
 *   const { session, authState, user, isAuthenticated, isLoading } = useAuth();
 *
 *   if (isLoading) {
 *     return <LoadingScreen />;
 *   }
 *
 *   return isAuthenticated ? <AuthenticatedApp /> : <LoginScreen />;
 * }
 * ```
 */

// Context & Hooks
export * from "./context/AuthContext";

// API Functions
export * from "./api";

// Custom Hooks
export * from "./hooks";

// Types
export * from "./types";

// Components
export * from "./components/SocialMediaButton";

// Screens
export * from "./screens/AuthTitleSection";
export * from "./screens/FormSection";
export * from "./screens/SocialOauthSection";
