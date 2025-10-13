# Authentication Implementation

Supabase公式ドキュメントに基づいた認証機能の実装

## 概要

このドキュメントは、Supabase Auth を使用した認証機能の実装について説明します。
SOLID原則に従い、APIレイヤーとHooksレイヤーに分離した設計となっています。

## アーキテクチャ

```
src/features/auth/
├── api/                    # APIレイヤー
│   ├── auth.api.ts        # 認証操作（サインイン/サインアップ/サインアウト）
│   ├── auth-session.api.ts # セッション管理
│   └── index.ts           # APIエクスポート
├── hooks/                  # Hooksレイヤー
│   ├── useSignIn.ts       # サインインフック
│   ├── useSignUp.ts       # サインアップフック
│   ├── useSignOut.ts      # サインアウトフック
│   ├── useAuthSession.ts  # セッション管理フック
│   ├── useOAuthSignIn.ts  # OAuthサインインフック
│   └── index.ts           # Hooksエクスポート
└── types/                  # 型定義
    ├── auth.types.ts      # 認証関連型定義
    └── index.ts           # 型エクスポート
```

## 設計原則

### 1. 単一責任の原則 (Single Responsibility Principle)

各関数・フックは1つの責任のみを持ちます：

- `signInWithPassword`: メール/パスワードでのサインイン
- `signUpWithPassword`: 新規アカウント作成
- `signOut`: サインアウト
- `signInWithOAuth`: OAuthサインイン
- `getSession`: セッション取得
- `getCurrentUser`: 現在のユーザー取得
- `refreshSession`: セッションリフレッシュ

### 2. 依存性逆転の原則 (Dependency Inversion Principle)

Hooksレイヤーは具体的なSupabase実装に依存せず、APIレイヤーのインターフェースに依存します：

```typescript
// ✅ Good: APIレイヤー経由でアクセス
import { signInWithPassword } from "../api";
const { mutate } = useMutation({ mutationFn: signInWithPassword });

// ❌ Bad: Supabaseクライアントに直接依存
import { supabase } from "@/shared/utils/supabase";
const { data } = await supabase.auth.signInWithPassword(...);
```

### 3. インターフェース分離の原則 (Interface Segregation Principle)

各フックは必要最小限のインターフェースのみを公開します：

```typescript
// useSignIn: サインインに必要な機能のみ
export function useSignIn(options?: {
  onSuccess?: (data: AuthResponse) => void;
  onError?: (error: AuthError) => void;
}) { ... }
```

## APIレイヤー

### auth.api.ts

認証操作を提供する関数群。

#### `signInWithPassword`

メールアドレスとパスワードでサインインします。

```typescript
const response = await signInWithPassword({
  email: "user@example.com",
  password: "password123",
});
// response: { session: Session | null, user: User | null }
```

#### `signUpWithPassword`

新規アカウントを作成します。

```typescript
const response = await signUpWithPassword({
  email: "user@example.com",
  password: "password123",
});
// メール確認が必要な場合、session は null
```

#### `signOut`

現在のユーザーをサインアウトします。

```typescript
await signOut();
```

#### `signInWithOAuth`

OAuthプロバイダーでサインインします。

```typescript
await signInWithOAuth("google"); // 'google' | 'github' | 'apple'
```

### auth-session.api.ts

セッション管理を提供する関数群。

#### `getSession`

現在のセッションを取得します。

```typescript
const session = await getSession();
```

#### `getCurrentUser`

現在のユーザー情報を取得します。

```typescript
const user = await getCurrentUser();
```

#### `refreshSession`

セッションを手動でリフレッシュします。

```typescript
const newSession = await refreshSession();
```

## Hooksレイヤー

React Queryを使用して、APIレイヤーの関数をReactコンポーネントで使いやすい形で提供します。

### useSignIn

サインイン操作を提供するフック。

```typescript
function LoginScreen() {
  const { mutate: signIn, isPending, error } = useSignIn({
    onSuccess: (data) => {
      console.log("Signed in:", data.user);
      // ナビゲーション処理など
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const handleSubmit = (formData: { email: string; password: string }) => {
    signIn(formData);
  };

  return (
    <View>
      {/* フォーム実装 */}
      <Button onPress={handleSubmit} disabled={isPending} />
    </View>
  );
}
```

### useSignUp

サインアップ操作を提供するフック。

```typescript
function SignUpScreen() {
  const { mutate: signUp, isPending } = useSignUp({
    onSuccess: (data) => {
      if (!data.session) {
        Alert.alert("Success", "Please check your email for verification!");
      }
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const handleSubmit = (formData: { email: string; password: string }) => {
    signUp(formData);
  };
}
```

### useSignOut

サインアウト操作を提供するフック。

```typescript
function ProfileScreen() {
  const { mutate: handleSignOut, isPending } = useSignOut({
    onSuccess: () => {
      console.log("Signed out successfully");
    },
  });

  return <Button onPress={() => handleSignOut()} disabled={isPending} />;
}
```

### useAuthSession

認証セッション状態を監視・管理するフック。

```typescript
function App() {
  const { session, authState, user, isAuthenticated, isLoading } =
    useAuthSession();

  if (isLoading) {
    return <SplashScreen />;
  }

  if (isAuthenticated && user) {
    return <AuthenticatedApp user={user} />;
  }

  return <LoginScreen />;
}
```

**特徴:**

- アプリ起動時に自動的にセッションを取得
- 認証状態の変更を自動的に監視
- サインイン/サインアウトイベントを追跡
- クリーンアップ処理を自動実行

### useOAuthSignIn

OAuthサインインを提供するフック。

```typescript
function SocialLoginButtons() {
  const { mutate: signInWithOAuth, isPending } = useOAuthSignIn({
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  return (
    <View>
      <Button onPress={() => signInWithOAuth("google")} disabled={isPending} />
      <Button onPress={() => signInWithOAuth("github")} disabled={isPending} />
    </View>
  );
}
```

## 型定義

### AuthResponse

```typescript
interface AuthResponse {
  session: Session | null;
  user: User | null;
}
```

### SignInCredentials / SignUpCredentials

```typescript
interface SignInCredentials {
  email: string;
  password: string;
}

interface SignUpCredentials {
  email: string;
  password: string;
}
```

### OAuthProvider

```typescript
type OAuthProvider = "google" | "github" | "apple";
```

### AuthState

```typescript
type AuthState = "authenticated" | "unauthenticated" | "loading";
```

## エラーハンドリング

すべてのAPI関数は、エラーが発生した場合に`AuthError`をthrowします。
React Queryを使用するフックでは、`onError`コールバックでエラーをハンドリングできます。

```typescript
const { mutate: signIn } = useSignIn({
  onError: (error: AuthError) => {
    // エラーメッセージを表示
    Alert.alert("Authentication Error", error.message);

    // エラーログ
    console.error("Sign in failed:", error);

    // エラー種別による分岐
    if (error.message.includes("Invalid credentials")) {
      // 認証情報エラー処理
    }
  },
});
```

## セキュリティ

### Secure Store

Supabaseクライアントは`expo-secure-store`を使用して、認証トークンを安全に保存します：

- **iOS**: Keychain Services
- **Android**: Keystore system

詳細は `src/shared/utils/supabase.ts` を参照。

### Auto Refresh

セッションの自動リフレッシュが有効になっています：

```typescript
// supabase.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

## 参考資料

- [Supabase Auth - Expo React Native Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [Supabase Auth API Reference](https://supabase.com/docs/reference/javascript/auth-api)
- [TanStack React Query](https://tanstack.com/query/latest)

## 今後の拡張

- [ ] パスワードリセット機能
- [ ] メールアドレス変更機能
- [ ] プロフィール更新機能
- [ ] 多要素認証(MFA)対応
- [ ] ソーシャルログイン拡張（Twitter, Facebook等）
