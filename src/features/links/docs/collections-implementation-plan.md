# Collections 機能 実装計画（機能単位）

> **最終更新**: 2026年2月15日  
> **前提**: UIレイヤーは実装済み。本ドキュメントは API・hooks・types の統合実装を**機能単位**で整理する。  
> **関連**:
> - [Collection定義と利用状況の詳細整理](./collection-definition.md)
> - [Collections UI 不足洗い出し](./collections-ui-gap-analysis.md)

## 📋 目次

1. [概要](#概要)
2. [共通基盤](#共通基盤)
3. [機能別実装計画](#機能別実装計画)
4. [実装順序と依存関係](#実装順序と依存関係)
5. [参照ガイドライン](#参照ガイドライン)

---

## 概要

### 現状

- **UI**: 実装済み（CollectionListScreen, CollectionDetailScreen, CollectionCreateModal, CollectionEditModal, CollectionChip 等）
- **DB**: `collections`, `collection_links` テーブル定義済み、RLS 有効
- **型**: `Collection`, `CollectionLink` 基本型のみ定義済み
- **API / Hooks**: 未実装（モックデータ使用中）

### 本ドキュメントの構成

レイヤー（API, hooks, types）ではなく、**機能**（追加・削除・取得など）ごとに、その機能に必要な types / api / hooks / UI 接続をまとめる。

### 実装順序

**作成 → 一覧取得** の順で実装する。作成を先に実装することで、一覧取得実装時に既にデータが存在し、動作確認しやすい。

---

## 共通基盤

以下の共通基盤を先に整備する。

### 1. クエリキー定義

**ファイル**: `src/features/links/constants/queryKeys.ts`

```typescript
export const collectionQueryKeys = {
  all: ["collections"] as const,
  lists: () => [...collectionQueryKeys.all, "list"] as const,
  details: () => [...collectionQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...collectionQueryKeys.details(), id] as const,
  links: (collectionId: string) =>
    [...collectionQueryKeys.detail(collectionId), "links"] as const,
} as const;
```

### 2. リクエスト/レスポンス型・Zodスキーマ

**ファイル**: `src/features/links/types/collections.types.ts`（新規）

```typescript
import { z } from "zod";

export interface CreateCollectionParams {
  name: string;
  description?: string | null;
  emoji?: string | null;
}

export interface UpdateCollectionParams {
  name?: string;
  description?: string | null;
  emoji?: string | null;
}

export const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  emoji: z.string().max(10).optional().nullable(),
});

export const updateCollectionSchema = createCollectionSchema.partial();
```

### 3. インデックス追加（パフォーマンス）

Supabase Postgres Best Practices に従い、以下のインデックスを検討：

```sql
-- collections: user_id での検索高速化
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);

-- collection_links: link_id での検索高速化
CREATE INDEX IF NOT EXISTS idx_collection_links_link_id ON collection_links(link_id);
```

---

## 機能別実装計画

### 実装順序の方針

**作成 → 一覧取得** の順で実装する。作成が先に動くことで、一覧取得実装時に既にデータが存在し、動作確認しやすい。

---

### 機能1: コレクション作成

**利用箇所**: CollectionCreateModal, LinkDetailScreen（「+ 新規コレクション」）

| レイヤー | 内容 |
| -------- | ---- |
| **types** | `CreateCollectionParams`, `createCollectionSchema`（共通基盤） |
| **api** | `createCollection.api.ts` - `supabase.from("collections").insert()` |
| **hooks** | `useCreateCollection.ts` - `useMutation` |
| **UI接続** | CollectionCreateModal の `handleSubmit` で `createCollection.mutate({ name, description, emoji })` を呼び出し |

**API関数**:

```typescript
// api/createCollection.api.ts
export async function createCollection(
  params: CreateCollectionParams
): Promise<Collection>
```

**フック**:

```typescript
// hooks/useCreateCollection.ts
export function useCreateCollection(): UseMutationResult<
  Collection,
  Error,
  CreateCollectionParams
>
```

**onSuccess**: `queryClient.invalidateQueries({ queryKey: collectionQueryKeys.lists() })`、モーダルを閉じる

---

### 機能2: コレクション一覧取得

**利用箇所**: CollectionListScreen, LinksOverViewScreen, CollectionsLane, LinkDetailScreen, LinkCreateModal

| レイヤー | 内容 |
| -------- | ---- |
| **types** | 既存 `Collection` で十分。必要なら `CollectionWithCount` 等を拡張 |
| **api** | `fetchCollections.api.ts` - `supabase.from("collections").select()` |
| **hooks** | `useCollections.ts` - `useQuery` + `collectionQueryKeys.lists()` |
| **UI接続** | CollectionListScreen, CollectionsLane, LinkDetailScreen の MOCK_COLLECTIONS → `useCollections()` に差し替え |

**API関数**:

```typescript
// api/fetchCollections.api.ts
export async function fetchCollections(): Promise<Collection[]>
```

**フック**:

```typescript
// hooks/useCollections.ts
export function useCollections(): UseQueryResult<Collection[], Error>
```

**キャッシュ無効化**: `createCollection`, `updateCollection`, `deleteCollection` 成功時に `collectionQueryKeys.lists()` を invalidate

---

### 機能3: コレクション編集

**利用箇所**: CollectionEditModal（CollectionDetailScreen の Edit メニューから表示）

| レイヤー | 内容 |
| -------- | ---- |
| **types** | `UpdateCollectionParams`, `updateCollectionSchema`（共通基盤） |
| **api** | `updateCollection.api.ts` - `supabase.from("collections").update().eq()` |
| **hooks** | `useUpdateCollection.ts` - `useMutation` |
| **UI接続** | CollectionEditModal の `handleSubmit` で `updateCollection.mutate({ id: collectionId, params })` を呼び出し |

**API関数**:

```typescript
// api/updateCollection.api.ts
export async function updateCollection(
  id: string,
  params: UpdateCollectionParams
): Promise<Collection>
```

**フック**:

```typescript
// hooks/useUpdateCollection.ts
export function useUpdateCollection(): UseMutationResult<
  Collection,
  Error,
  { id: string; params: UpdateCollectionParams }
>
```

**onSuccess**: `collectionQueryKeys.lists()` と `collectionQueryKeys.detail(id)` を invalidate、モーダルを閉じる

---

### 機能4: コレクション削除

**利用箇所**: CollectionDetailScreen（Delete メニュー）、`app/(protected)/collections/[id].tsx`

| レイヤー | 内容 |
| -------- | ---- |
| **types** | 追加不要 |
| **api** | `deleteCollection.api.ts` - `supabase.from("collections").delete().eq()` |
| **hooks** | `useDeleteCollection.ts` - `useMutation` |
| **UI接続** | `collections/[id].tsx` の `handleDelete` 確認後、`deleteCollection.mutate(collectionId)` を呼び出し、成功時に `router.back()` |

**API関数**:

```typescript
// api/deleteCollection.api.ts
export async function deleteCollection(id: string): Promise<void>
```

**フック**:

```typescript
// hooks/useDeleteCollection.ts
export function useDeleteCollection(): UseMutationResult<void, Error, string>
```

**注意**: `collection_links` の CASCADE 削除が DB に設定されていない場合、先に `collection_links` を削除するか、DB に `ON DELETE CASCADE` を追加する必要あり。collection-definition.md の「削除時の動作」を確認。

---

### 機能5: コレクション詳細取得

**利用箇所**: CollectionDetailScreen（ヘッダー表示用の name, emoji, itemsCount）

| レイヤー | 内容 |
| -------- | ---- |
| **types** | 既存 `Collection` で十分。itemsCount が必要なら API で count を返すか、別クエリで取得 |
| **api** | `getCollection.api.ts` - `supabase.from("collections").select().eq().single()` |
| **hooks** | `useCollection.ts` - `useQuery` + `collectionQueryKeys.detail(id)` |
| **UI接続** | CollectionDetailScreen の `mockCollections[collectionId]` → `useCollection(collectionId)` に差し替え |

**API関数**:

```typescript
// api/getCollection.api.ts
export async function getCollection(id: string): Promise<Collection>
```

**フック**:

```typescript
// hooks/useCollection.ts
export function useCollection(id: string | undefined): UseQueryResult<Collection | null, Error>
```

**enabled**: `id != null && id !== ""`

---

### 機能6: コレクション内リンク一覧取得

**利用箇所**: CollectionDetailScreen（FlashList の data）

| レイヤー | 内容 |
| -------- | ---- |
| **types** | 既存 `UserLink`（linkList.types）で十分。`collection_links` と `links` + `link_status` を JOIN して取得 |
| **api** | `fetchCollectionLinks.api.ts` - `collection_links` と `links`, `link_status` を JOIN |
| **hooks** | `useCollectionLinks.ts` - `useQuery` + `collectionQueryKeys.links(collectionId)` |
| **UI接続** | CollectionDetailScreen の `MOCK_COLLECTION_LINKS[collectionId]` → `useCollectionLinks(collectionId)` に差し替え |

**API関数**:

```typescript
// api/fetchCollectionLinks.api.ts
export async function fetchCollectionLinks(
  collectionId: string
): Promise<UserLink[]>
```

**クエリ例**（Supabase）:

```typescript
// collection_links 経由で links + link_status を取得
const { data, error } = await supabase
  .from("collection_links")
  .select(`
    link_id,
    links!inner(...),
    link_status!inner(...)
  `)
  .eq("collection_id", collectionId);
// UserLink 形式に変換するヘルパーが必要
```

**注意**: 既存の `fetchUserLinks` や `UserLink` 型との整合性を確認。必要に応じて RPC またはビューを検討。

---

### 機能7: リンクをコレクションに追加

**利用箇所**: LinkDetailScreen（CollectionChip タップで追加）, LinkCreateModal（保存時のコレクション選択）, Swipe UI（将来）

| レイヤー | 内容 |
| -------- | ---- |
| **types** | `{ collectionId: string; linkId: string }` または個別引数 |
| **api** | `addLinkToCollection.api.ts` - `supabase.from("collection_links").insert()` |
| **hooks** | `useAddLinkToCollection.ts` - `useMutation` |
| **UI接続** | LinkDetailScreen の `handleToggleCollection` で追加時、LinkCreateModal の保存時に呼び出し |

**API関数**:

```typescript
// api/addLinkToCollection.api.ts
export async function addLinkToCollection(
  collectionId: string,
  linkId: string
): Promise<CollectionLink>
```

**フック**:

```typescript
// hooks/useAddLinkToCollection.ts
export function useAddLinkToCollection(): UseMutationResult<
  CollectionLink,
  Error,
  { collectionId: string; linkId: string }
>
```

**onSuccess**: `collectionQueryKeys.links(collectionId)` と `linkQueryKeys.detail(linkId)` を invalidate。重複追加時はユニーク制約エラー → ユーザーに適切なフィードバック。

---

### 機能8: リンクをコレクションから削除

**利用箇所**: LinkDetailScreen（CollectionChip タップで解除）

| レイヤー | 内容 |
| -------- | ---- |
| **types** | 追加不要 |
| **api** | `removeLinkFromCollection.api.ts` - `supabase.from("collection_links").delete().eq().eq()` |
| **hooks** | `useRemoveLinkFromCollection.ts` - `useMutation` |
| **UI接続** | LinkDetailScreen の `handleToggleCollection` で削除時 |

**API関数**:

```typescript
// api/removeLinkFromCollection.api.ts
export async function removeLinkFromCollection(
  collectionId: string,
  linkId: string
): Promise<void>
```

**フック**:

```typescript
// hooks/useRemoveLinkFromCollection.ts
export function useRemoveLinkFromCollection(): UseMutationResult<
  void,
  Error,
  { collectionId: string; linkId: string }
>
```

**onSuccess**: `collectionQueryKeys.links(collectionId)` と `linkQueryKeys.detail(linkId)` を invalidate

---

### LinkCreateModal 保存フロー（機能7との連携）

リンク作成時にコレクションを選択している場合の処理：

1. `useCreateLink().createLink(url)` でリンク作成
2. レスポンスの `link_id` を取得
3. `selectedCollectionIds` の各 ID に対して `addLinkToCollection(collectionId, link_id)` を呼び出し
4. 全成功後にモーダルを閉じる

`useCreateLink` を拡張するか、LinkCreateModal 内で `useCreateLink` と `useAddLinkToCollection` を組み合わせて実装する。

---

### 機能9: リンクに紐づくコレクション一覧取得（リンク詳細用）

**利用箇所**: LinkDetailScreen（このリンクが属するコレクションを表示・トグル）

| レイヤー | 内容 |
| -------- | ---- |
| **types** | `Collection` の配列、または `{ collection: Collection; isLinked: boolean }[]` |
| **api** | `fetchCollectionsForLink.api.ts` - `collection_links` と `collections` を JOIN、または `useCollections` + クライアント側フィルタ |
| **hooks** | `useCollectionsForLink.ts` - `useCollections` と `useCollectionLinksByLink` を組み合わせるか、専用 API |
| **UI接続** | LinkDetailScreen の `linkedCollectionIds` をサーバーデータに差し替え |

**方針**: シンプルに `useCollections()` で全コレクションを取得し、`useCollectionLinksByLink(linkId)` でこのリンクが属するコレクションID一覧を取得。クライアントでマージして表示。または、`fetchCollectionsForLink(linkId)` で「全コレクション + 各コレクションにこのリンクが含まれるか」を返す API を用意。

---

## 実装順序と依存関係

```
共通基盤（クエリキー、型、Zod）
    ↓
機能1: コレクション作成  ← 最初に実装。作成後に一覧で確認できる
    ↓
機能2: コレクション一覧取得  ← 他機能の invalidate 先
    ↓
機能5: コレクション詳細取得
    ↓
機能3: コレクション編集
機能4: コレクション削除
    ↓
機能6: コレクション内リンク一覧取得
    ↓
機能7: リンクをコレクションに追加
機能8: リンクをコレクションから削除
機能9: リンクに紐づくコレクション一覧取得
```

**推奨実装順**:

1. **共通基盤**（クエリキー、型、Zod）
2. **機能1: コレクション作成** → CollectionCreateModal の API 連携
3. **機能2: コレクション一覧取得** → CollectionListScreen, CollectionsLane, LinkDetailScreen 等のモック差し替え
4. **機能5: コレクション詳細取得** → CollectionDetailScreen のヘッダー
5. **機能3 + 機能4**（編集・削除）→ CollectionEditModal, 削除フロー
6. **機能6** → CollectionDetailScreen のリンク一覧
7. **機能7 + 機能8 + 機能9** → LinkDetailScreen, LinkCreateModal のコレクション連携

---

## 参照ガイドライン

### アーキテクチャ

- [React Native Expo Architecture](.cursor/rules/react-native-expo-architecture.mdc): API は `api/`、ロジックは `hooks/`、型は `types/` に配置
- [Simplicity-First Design](.cursor/rules/simplicity-first-design.mdc): 過度な分割を避け、1機能1フックで完結させる

### データ取得・ネットワーク

- [native-data-fetching](.cursor/skills/native-data-fetching/SKILL.md): React Query の `useQuery` / `useMutation`、`queryClient.invalidateQueries`、エラーハンドリング
- fetch を優先、axios は避ける

### データベース

- [supabase-postgres-best-practices](.cursor/skills/supabase-postgres-best-practices/SKILL.md): インデックス、RLS、クエリ最適化
- [collection-definition.md](./collection-definition.md): スキーマ、RLS、制約

### React Native

- [vercel-react-native-skills](.cursor/skills/vercel-react-native-skills/SKILL.md): FlashList、expo-image、Pressable、リストパフォーマンス

### 既存パターン

- `useCreateLink`, `useDeleteLink`, `useLinks`, `useLinkDetail`: フックの戻り値・エラーハンドリングの参考
- `createLink.api.ts`, `deleteLink.api.ts`: API 関数の構造・Zod 検証の参考
- `linkQueryKeys`: クエリキーの階層構造の参考

---

## クイックリファレンス

| 機能 | API | Hook | 主なUI |
| ---- | --- | ---- | ------ |
| 作成 | `createCollection` | `useCreateCollection` | CollectionCreateModal |
| 一覧取得 | `fetchCollections` | `useCollections` | CollectionListScreen, CollectionsLane |
| 編集 | `updateCollection` | `useUpdateCollection` | CollectionEditModal |
| 削除 | `deleteCollection` | `useDeleteCollection` | collections/[id].tsx |
| 詳細取得 | `getCollection` | `useCollection` | CollectionDetailScreen |
| コレクション内リンク | `fetchCollectionLinks` | `useCollectionLinks` | CollectionDetailScreen |
| リンク追加 | `addLinkToCollection` | `useAddLinkToCollection` | LinkDetailScreen, LinkCreateModal |
| リンク削除 | `removeLinkFromCollection` | `useRemoveLinkFromCollection` | LinkDetailScreen |
| リンク別コレクション | （useCollections + 専用取得） | `useCollectionsForLink` | LinkDetailScreen |
