# Collection定義と利用状況の詳細整理

> **最終更新**: 2026年2月10日  
> **確認方法**: Supabase MCP経由で実際のDB構造を確認
>
> **関連**:
>
> - [Supabase Collections DB 設定（MCP検証済み）](./collections-supabase-db-configuration.md) - 現在のDB状態の簡易リファレンス
> - [Collections UI 不足洗い出し](./collections-ui-gap-analysis.md) - 画面・コンポーネントの実装状況（API 含まず）

## 📋 目次

1. [データベーススキーマ定義](#データベーススキーマ定義)
2. [型定義](#型定義)
3. [セキュリティ設定（RLS）](#セキュリティ設定rls)
4. [インデックスとパフォーマンス](#インデックスとパフォーマンス)
5. [トリガーと自動更新](#トリガーと自動更新)
6. [制約とデータ整合性](#制約とデータ整合性)
7. [現在の実装状況](#現在の実装状況)
8. [実装が必要な機能](#実装が必要な機能)

---

## データベーススキーマ定義

### 1. `collections`テーブル

**定義場所**: `src/features/links/types/supabase.types.ts` (54-88行目)

#### テーブル構造

| カラム名      | データ型      | NULL許可 | デフォルト値        | 説明                               |
| ------------- | ------------- | -------- | ------------------- | ---------------------------------- |
| `id`          | `uuid`        | NO       | `gen_random_uuid()` | 主キー（自動生成）                 |
| `user_id`     | `uuid`        | NO       | -                   | ユーザーID（外部キー: `users.id`） |
| `name`        | `text`        | NO       | -                   | コレクション名（必須）             |
| `description` | `text`        | YES      | -                   | 説明文（オプション）               |
| `emoji`       | `text`        | YES      | -                   | 表示用絵文字（オプション、例: 📚） |
| `created_at`  | `timestamptz` | YES      | `now()`             | 作成日時（自動設定）               |
| `updated_at`  | `timestamptz` | YES      | `now()`             | 更新日時（自動設定）               |

#### 主キー

- **制約名**: `collections_pkey`
- **カラム**: `id`
- **インデックス**: `btree (id)`

#### 外部キー制約

| 制約名                     | カラム    | 参照先テーブル | 参照先カラム |
| -------------------------- | --------- | -------------- | ------------ |
| `collections_user_id_fkey` | `user_id` | `public.users` | `id`         |

**注意**: `collections.user_id`は`public.users.id`を参照します。`public.users.id`は`auth.users.id`への外部キーを持ちます。

#### チェック制約

- `id IS NOT NULL`
- `user_id IS NOT NULL`
- `name IS NOT NULL`

#### データ件数

- **現在のレコード数**: 0件

---

### 2. `collection_links`テーブル（中間テーブル）

**定義場所**: `src/features/links/types/supabase.types.ts` (17-53行目)

#### テーブル構造

| カラム名        | データ型 | NULL許可 | デフォルト値 | 説明                                         |
| --------------- | -------- | -------- | ------------ | -------------------------------------------- |
| `collection_id` | `uuid`   | NO       | -            | コレクションID（外部キー: `collections.id`） |
| `link_id`       | `uuid`   | NO       | -            | リンクID（外部キー: `links.id`）             |

#### 複合主キー

- **制約名**: `collection_links_pkey`
- **カラム**: `(collection_id, link_id)`
- **インデックス**: `btree (collection_id, link_id)`
- **特徴**: 同じリンクを同じコレクションに重複追加できない（ユニーク制約）

#### 外部キー制約

| 制約名                                | カラム          | 参照先テーブル | 参照先カラム |
| ------------------------------------- | --------------- | -------------- | ------------ |
| `collection_links_collection_id_fkey` | `collection_id` | `collections`  | `id`         |
| `collection_links_link_id_fkey`       | `link_id`       | `links`        | `id`         |

#### チェック制約

- `collection_id IS NOT NULL`
- `link_id IS NOT NULL`

#### データ件数

- **現在のレコード数**: 0件

---

### 3. データモデル図

```
┌─────────────────┐
│   auth.users     │
│  (Supabase Auth)│
└────────┬────────┘
         │
         │ (1)
         │
         │ (1)
┌────────▼────────┐
│  public.users   │
│                 │
│ - id (PK, FK)   │
│ - user_id       │
│ - username      │
│ - avatar_url    │
│ - ...           │
└────────┬────────┘
         │
         │ (1)
         │
         │ (N)
┌────────▼────────┐
│   collections   │
│                 │
│ - id (PK)       │
│ - user_id (FK)  │
│ - name          │
│ - description   │
│ - created_at    │
│ - updated_at    │
└────────┬────────┘
         │
         │ (1)
         │
         │ (N)
┌────────▼──────────────┐
│   collection_links    │
│   (中間テーブル)      │
│                       │
│ - collection_id (PK)  │
│ - link_id (PK)        │
└────────┬──────────────┘
         │
         │ (N)
         │
         │ (1)
┌────────▼────────┐
│      links      │
│                 │
│ - id (PK)       │
│ - url           │
│ - title         │
│ - ...           │
└─────────────────┘
```

**リレーションシップ**:

- `auth.users` (1) → `public.users` (1) - 1対1の関係
- `public.users` (1) → `collections` (N) - 1ユーザーが複数のコレクションを持つ
- `collections` (1) → `collection_links` (N) - 1コレクションに複数のリンクを追加可能
- `links` (1) → `collection_links` (N) - 1リンクを複数のコレクションに追加可能
- 結果として、コレクションとリンクは多対多の関係（中間テーブル経由）

---

## 型定義

### TypeScript型定義

**定義場所**: `src/features/links/types/links.types.ts`

```typescript
import type { Tables } from "./supabase.types";

export type Collection = Tables<"collections">;
export type CollectionLink = Tables<"collection_links">;
```

### 型の詳細

#### `Collection`型

```typescript
type Collection = {
  id: string; // UUID
  user_id: string; // UUID (users.idへの外部キー)
  name: string; // 必須
  description: string | null; // オプション
  emoji: string | null; // オプション（表示用絵文字、例: 📚）
  created_at: string | null; // ISO8601形式のタイムスタンプ
  updated_at: string | null; // ISO8601形式のタイムスタンプ
};
```

#### `CollectionLink`型

```typescript
type CollectionLink = {
  collection_id: string; // UUID (collections.idへの外部キー)
  link_id: string; // UUID (links.idへの外部キー)
};
```

### エクスポート

**定義場所**: `src/features/links/types/index.ts`

```typescript
export * from "./links.types";
// Collection, CollectionLink がエクスポートされる
```

**使用例**:

```typescript
// または
import type { Collection, CollectionLink } from "@features/links";
import type { Collection, CollectionLink } from "@features/links/types";
```

---

## セキュリティ設定（RLS）

### Row Level Security (RLS) 有効化

両テーブルともRLSが有効化されています。

### RLSポリシー

#### `collections`テーブル

**ポリシー名**: `Users can manage their own collections`

- **適用範囲**: `authenticated`ロール
- **操作**: `ALL` (SELECT, INSERT, UPDATE, DELETE)
- **条件**: `auth.uid() = user_id`
- **説明**: 認証されたユーザーは自分のコレクションのみ操作可能

**SQL**:

```sql
-- SELECT/UPDATE/DELETE用
(( SELECT auth.uid() AS uid) = user_id)

-- INSERT用（with_check）
(( SELECT auth.uid() AS uid) = user_id)
```

#### `collection_links`テーブル

**ポリシー名**: `Users can manage their own collection links`

- **適用範囲**: `authenticated`ロール
- **操作**: `ALL` (SELECT, INSERT, UPDATE, DELETE)
- **条件**: コレクションが自分のものであること
- **説明**: 認証されたユーザーは自分のコレクションに紐づくリンクのみ操作可能

**SQL**:

```sql
-- SELECT/UPDATE/DELETE用
(EXISTS (
  SELECT 1
  FROM collections
  WHERE collections.id = collection_links.collection_id
    AND collections.user_id = auth.uid()
))

-- INSERT用（with_check）
(EXISTS (
  SELECT 1
  FROM collections
  WHERE collections.id = collection_links.collection_id
    AND collections.user_id = auth.uid()
))
```

### セキュリティの特徴

1. **ユーザー分離**: 各ユーザーは自分のコレクションのみアクセス可能
2. **中間テーブル保護**: `collection_links`への操作も、所有するコレクション経由でのみ許可
3. **自動認証チェック**: `auth.uid()`を使用して現在のユーザーを自動判定

---

## インデックスとパフォーマンス

### インデックス一覧

#### `collections`テーブル

| インデックス名     | タイプ | カラム | 説明               |
| ------------------ | ------ | ------ | ------------------ |
| `collections_pkey` | UNIQUE | `id`   | 主キーインデックス |

#### `collection_links`テーブル

| インデックス名          | タイプ | カラム                     | 説明                   |
| ----------------------- | ------ | -------------------------- | ---------------------- |
| `collection_links_pkey` | UNIQUE | `(collection_id, link_id)` | 複合主キーインデックス |

### パフォーマンス考慮事項

#### 推奨される追加インデックス

実装時に以下のインデックス追加を検討：

1. **`collection_links`テーブル**

   ```sql
   -- link_idでの検索を高速化（コレクションに含まれるリンクを検索）
   CREATE INDEX idx_collection_links_link_id
     ON collection_links(link_id);

   -- collection_idでの検索を高速化（コレクション内のリンク一覧取得）
   -- 注意: 複合主キーの最初のカラムなので、既にインデックス効果あり
   ```

2. **`collections`テーブル**
   ```sql
   -- user_idでの検索を高速化（ユーザーのコレクション一覧取得）
   CREATE INDEX idx_collections_user_id
     ON collections(user_id);
   ```

---

## トリガーと自動更新

### `collections`テーブルのトリガー

**トリガー名**: `update_collections_updated_at`

- **イベント**: `UPDATE`
- **タイミング**: `BEFORE`
- **関数**: `update_updated_at_column()`
- **動作**: `collections`テーブルのレコードが更新される際、`updated_at`カラムを自動的に現在時刻に更新

**注意**: `collection_links`テーブルにはトリガーが設定されていません（中間テーブルのため、通常は更新操作が不要）

---

## 制約とデータ整合性

### NOT NULL制約

#### `collections`テーブル

- `id` - 必須
- `user_id` - 必須
- `name` - 必須

#### `collection_links`テーブル

- `collection_id` - 必須
- `link_id` - 必須

### 外部キー制約による整合性保証

1. **参照整合性**:
   - `collections.user_id` → `users.id`（ユーザーが存在しないとコレクション作成不可）
   - `collection_links.collection_id` → `collections.id`（コレクションが存在しないとリンク追加不可）
   - `collection_links.link_id` → `links.id`（リンクが存在しないと追加不可）

2. **削除時の動作**:
   - デフォルトでは外部キー制約により、参照されているレコードは削除不可
   - 必要に応じて`ON DELETE CASCADE`の追加を検討

### ユニーク制約

- `collection_links`テーブルの複合主キーにより、同じリンクを同じコレクションに重複追加できない

---

## 現在の実装状況

### ✅ 実装済み

1. **データベーススキーマ**
   - ✅ `collections`テーブル定義
   - ✅ `collection_links`テーブル定義
   - ✅ 外部キー制約
   - ✅ RLSポリシー
   - ✅ トリガー（`updated_at`自動更新）

2. **TypeScript型定義**
   - ✅ `Collection`型
   - ✅ `CollectionLink`型
   - ✅ 型のエクスポート

### ❌ 未実装

1. **API関数** (`src/features/links/api/`)
   - ❌ `createCollection.api.ts` - コレクション作成
   - ❌ `fetchCollections.api.ts` - コレクション一覧取得
   - ❌ `getCollection.api.ts` - コレクション詳細取得
   - ❌ `updateCollection.api.ts` - コレクション更新
   - ❌ `deleteCollection.api.ts` - コレクション削除
   - ❌ `addLinkToCollection.api.ts` - リンクをコレクションに追加
   - ❌ `removeLinkFromCollection.api.ts` - リンクをコレクションから削除
   - ❌ `getCollectionLinks.api.ts` - コレクション内のリンク一覧取得

2. **型定義の拡張** (`src/features/links/types/`)
   - ❌ リクエスト/レスポンス型定義
   - ❌ Zodスキーマ（バリデーション用）

3. **カスタムフック** (`src/features/links/hooks/`)
   - ❌ `useCollections.ts` - コレクション一覧取得フック
   - ❌ `useCollection.ts` - コレクション詳細取得フック
   - ❌ `useCreateCollection.ts` - コレクション作成フック
   - ❌ `useUpdateCollection.ts` - コレクション更新フック
   - ❌ `useDeleteCollection.ts` - コレクション削除フック
   - ❌ `useCollectionLinks.ts` - コレクション内リンク取得フック
   - ❌ `useAddLinkToCollection.ts` - リンク追加フック
   - ❌ `useRemoveLinkFromCollection.ts` - リンク削除フック

4. **UIコンポーネント** (`src/features/links/components/`)
   - ❌ `CollectionList.tsx` - コレクション一覧表示
   - ❌ `CollectionCard.tsx` - コレクションカード
   - ❌ `CollectionForm.tsx` - コレクション作成・編集フォーム
   - ❌ `CollectionLinkList.tsx` - コレクション内リンク一覧
   - ❌ `AddToCollectionModal.tsx` - リンクをコレクションに追加するモーダル

5. **画面** (`src/features/links/screens/`)
   - ❌ `CollectionListScreen.tsx` - コレクション管理画面
   - ❌ `CollectionDetailScreen.tsx` - コレクション詳細画面

6. **クエリキー** (`src/features/links/constants/queryKeys.ts`)
   - ❌ collection関連のクエリキー定義

---

## 実装が必要な機能

### Phase 1: データ層の実装

#### 1.1 API関数の実装

**優先順位**: 高

```typescript
// src/features/links/api/collections.api.ts

// コレクション作成
export async function createCollection(params: {
  name: string;
  description?: string;
}): Promise<Collection>;

// コレクション一覧取得
export async function fetchCollections(): Promise<Collection[]>;

// コレクション詳細取得
export async function getCollection(id: string): Promise<Collection>;

// コレクション更新
export async function updateCollection(
  id: string,
  params: { name?: string; description?: string },
): Promise<Collection>;

// コレクション削除
export async function deleteCollection(id: string): Promise<void>;

// リンクをコレクションに追加
export async function addLinkToCollection(
  collectionId: string,
  linkId: string,
): Promise<CollectionLink>;

// リンクをコレクションから削除
export async function removeLinkFromCollection(
  collectionId: string,
  linkId: string,
): Promise<void>;

// コレクション内のリンク一覧取得
export async function getCollectionLinks(
  collectionId: string,
): Promise<UserLink[]>;
```

#### 1.2 型定義の拡張

**優先順位**: 高

```typescript
// src/features/links/types/collections.types.ts

// リクエスト型
export interface CreateCollectionParams {
  name: string;
  description?: string;
}

export interface UpdateCollectionParams {
  name?: string;
  description?: string;
}

// Zodスキーマ
export const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});
```

### Phase 2: ロジック層の実装

#### 2.1 カスタムフックの実装

**優先順位**: 高

```typescript
// src/features/links/hooks/useCollections.ts
export function useCollections(): UseQueryResult<Collection[], Error>;

// src/features/links/hooks/useCollection.ts
export function useCollection(id: string): UseQueryResult<Collection, Error>;

// src/features/links/hooks/useCreateCollection.ts
export function useCreateCollection(): UseMutationResult<
  Collection,
  Error,
  CreateCollectionParams
>;

// src/features/links/hooks/useUpdateCollection.ts
export function useUpdateCollection(): UseMutationResult<
  Collection,
  Error,
  { id: string; params: UpdateCollectionParams }
>;

// src/features/links/hooks/useDeleteCollection.ts
export function useDeleteCollection(): UseMutationResult<void, Error, string>;

// src/features/links/hooks/useCollectionLinks.ts
export function useCollectionLinks(
  collectionId: string,
): UseQueryResult<UserLink[], Error>;

// src/features/links/hooks/useAddLinkToCollection.ts
export function useAddLinkToCollection(): UseMutationResult<
  CollectionLink,
  Error,
  { collectionId: string; linkId: string }
>;

// src/features/links/hooks/useRemoveLinkFromCollection.ts
export function useRemoveLinkFromCollection(): UseMutationResult<
  void,
  Error,
  { collectionId: string; linkId: string }
>;
```

#### 2.2 クエリキーの追加

**優先順位**: 中

```typescript
// src/features/links/constants/queryKeys.ts に追加

export const collectionQueryKeys = {
  all: ["collections"] as const,
  lists: () => [...collectionQueryKeys.all, "list"] as const,
  list: (filters?: CollectionFilters) =>
    [...collectionQueryKeys.lists(), filters] as const,
  details: () => [...collectionQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...collectionQueryKeys.details(), id] as const,
  links: (collectionId: string) =>
    [...collectionQueryKeys.detail(collectionId), "links"] as const,
};
```

### Phase 3: UI層の実装

#### 3.1 UIコンポーネントの実装

**優先順位**: 中

- コレクション一覧表示コンポーネント
- コレクション作成・編集フォーム
- コレクション内リンク一覧
- リンク追加UI

#### 3.2 画面の実装

**優先順位**: 低

- コレクション管理画面
- コレクション詳細画面

---

## 実装時の注意事項

### 1. RLSポリシーの考慮

- すべてのAPI関数は認証済みユーザーとして実行される
- `auth.uid()`が自動的に適用されるため、明示的な`user_id`指定は不要（RLSが自動フィルタリング）

### 2. エラーハンドリング

- 外部キー制約違反時のエラーハンドリング
- RLSポリシー違反時のエラーハンドリング
- ユニーク制約違反時のエラーハンドリング（重複追加防止）

### 3. パフォーマンス最適化

- コレクション一覧取得時のページング検討
- コレクション内リンク一覧取得時のページング検討
- 必要に応じて追加インデックスの作成

### 4. データ整合性

- コレクション削除時の`collection_links`の扱い（CASCADE削除の検討）
- リンク削除時の`collection_links`の扱い

---

## まとめ

### 現在の状態

- ✅ **データベーススキーマ**: 完全に定義済み（RLS、制約、トリガー含む）
- ✅ **型定義**: 基本型は定義済み
- ❌ **API関数**: 未実装
- ❌ **カスタムフック**: 未実装
- ❌ **UIコンポーネント**: 未実装
- ❌ **画面**: 未実装

### 次のステップ

1. **Phase 1**: API関数と型定義の拡張を実装
2. **Phase 2**: React Queryを使用したカスタムフックを実装
3. **Phase 3**: UIコンポーネントと画面を実装

実装時は、既存の`links`機能の実装パターンを参考にし、アーキテクチャルールに従って段階的に進めることを推奨します。
