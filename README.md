# linkcache

Knowledge Triage & Growth Space のための Expo アプリです。  
リンクを素早く保存し、**Swipe UI** で「あとで読む」「ストック」「完了」へ整理することを目的にしています。

## 主な機能

- リンクの追加（URL貼り付け / メタデータ取得）
- スワイプでのトリアージ（Inbox → Read Soon/Stock → Completed）
- コレクション（分類）管理
- リンク詳細表示・ステータス更新
- Supabase Auth を使った認証
- iOS Share Extension を使ったリンク共有取り込み

## 技術スタック

- **Framework**: Expo (React Native)
- **Routing**: Expo Router
- **Language**: TypeScript
- **Server State**: TanStack React Query
- **Backend/Auth**: Supabase
- **Validation**: Zod
- **Styling**: NativeWind (Tailwind)
- **Testing**: Jest + React Native Testing Library
- **Package Manager**: pnpm

## セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 環境変数の準備

`.env.example` をコピーして `.env.local` を作成し、Supabase の値を設定してください。

```bash
cp .env.example .env.local
```

必須キー:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

必要に応じて開発ビルド向けに以下も設定できます。

- `APP_ENV=dev`

### 3. アプリ起動

```bash
pnpm expo start
```

## 開発コマンド

```bash
pnpm expo start      # 開発サーバー起動
pnpm test            # テスト実行
pnpm typecheck       # TypeScript 型チェック
pnpm lint            # ESLint
pnpm run check       # format:fix + lint + typecheck + test
```

## ディレクトリ構成（抜粋）

```text
app/                    # Expo Router ルート
src/
  features/
    auth/               # 認証
    links/              # リンク管理・スワイプ・コレクション
    users/              # プロフィール/設定
    share-extension/    # 共有拡張連携
  shared/               # 共通 components/hooks/utils/lib
```

## アーキテクチャ方針

- Feature 単位で `api/`, `hooks/`, `components/`, `screens/`, `types/` を整理
- API 呼び出しは `src/features/*/api` に集約
- データ取得・更新は React Query を中心に実装
- Supabase セッションは `expo-secure-store` 経由で安全に保持

## 補足

- iOS Share Extension の設定は `app.config.js` と `plugins/withShareExtension.ts` を参照してください。
- 本番/開発で bundle identifier や scheme が切り替わるため、`APP_ENV` の設定に注意してください。
