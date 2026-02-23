# Collections 機能 実装計画（機能単位）

> **最終更新**: 2026年2月23日（機能3・4 実装完了）  
> **前提**: UIレイヤーは実装済み。本ドキュメントは API・hooks・types の統合実装を**機能単位**で整理する。  
> **関連**:
>
> - [Collection定義と利用状況の詳細整理](./collection-definition.md)
> - [Collections UI 不足洗い出し](./collections-ui-gap-analysis.md)
> - [UIレイヤー リファクタリング案](./ui-refactoring-plan.md)

## 📋 目次

1. [概要](#概要)
2. [共通基盤](#共通基盤)
3. [機能別実装計画](#機能別実装計画)
4. [実装順序と依存関係](#実装順序と依存関係)
5. [クイックリファレンス](#クイックリファレンス)

---

## 概要

### 現状

- **UI**: 実装済み（CollectionListScreen, CollectionDetailScreen, CollectionCreateModal, CollectionEditModal, CollectionChip 等）
- **DB**: `collections`, `collection_links` テーブル定義済み、RLS 有効
- **型**: `Collection`, `CollectionLink`, `CollectionWithCount`（links.types.ts, collections.types.ts）
- **API / Hooks**: 機能1（作成）、機能2（一覧取得）、機能3（編集）、機能4（削除）、機能5（詳細取得）、機能6（コレクション内リンク一覧）、機能7（リンク追加）、機能8（リンク削除）、機能9（リンク別コレクション取得）実装済み

### アーキテクチャ（ルートと画面の責務）

- **`app/(protected)/collections/[id].tsx`**: ルーティングとレイアウトのみ。`rawId` を CollectionDetailScreen に渡す。
- **CollectionDetailScreen**: 画面ロジックを集約。`rawId` を解析し、useCollections + useCollection（フォールバック）でコレクション取得、Edit/Delete モーダル管理、メニュー表示。

### ブランチ戦略

- **統合ブランチ**: `feat/collections`
- 各機能はここから分岐し、完了したらここにマージ
- 全機能完了後に main へマージ

---

## 共通基盤

✅ **実装済み**

| 項目           | ファイル                                                                                                                                           |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| クエリキー     | `constants/queryKeys.ts` - `collectionQueryKeys`                                                                                                   |
| 型・Zod        | `types/collections.types.ts` - CreateCollectionParams, UpdateCollectionParams, CollectionWithCount, createCollectionSchema, updateCollectionSchema |
| DBインデックス | 適用済み（idx_collections_user_id, idx_collection_links_link_id）                                                                                  |

---

## 機能別実装計画

### 機能1: コレクション作成 ✅ 実装済み

- **API**: createCollection.api.ts（insert）
- **Hook**: useCreateCollection（useMutation、成功時に lists 無効化）
- **UI**: CollectionCreateModal, LinkDetailScreen（+ 新規コレクション）
- Zod バリデーション、モーダル onDismiss でフォームリセット

---

### 機能2: コレクション一覧取得 ✅ 実装済み

- **API**: fetchCollections.api.ts（select + collection_links(count)）
- **Hook**: useCollections（useQuery + collectionQueryKeys.lists()）
- **型**: CollectionWithCount（id, name, emoji, itemsCount）
- **UI**: CollectionListScreen, LinksOverViewScreen, CollectionsLane, LinkDetailScreen, LinkCreateModal, CollectionDetailScreen
- **CollectionDetailScreen**: `rawId` を受け取り parseCollectionId で ID 解析。useCollections で一覧取得し find で該当コレクションを特定。一覧に無い場合は useCollection で単体取得（フォールバック）。emoji 未設定時は name の頭文字をフォールバック表示。Edit メニューで CollectionEditModal を表示（useBottomSheetModal）

---

### 機能3: コレクション編集 ✅ 実装済み

**利用箇所**: CollectionEditModal（CollectionDetailScreen 内で useBottomSheetModal により表示）

| レイヤー | ファイル                  | 備考                                         |
| -------- | ------------------------- | -------------------------------------------- |
| api      | `updateCollection.api.ts` | `supabase.from("collections").update().eq()` |
| hooks    | `useUpdateCollection.ts`  | useMutation、引数 `{ id, params }`           |
| UI接続   | CollectionEditModal       | handleSubmit で mutate、isPending 中ボタン無効化 |

**invalidate**: `lists()` と `detail(id)`

---

### 機能4: コレクション削除 ✅ 実装済み

**利用箇所**: CollectionDetailScreen（Delete メニュー）

| レイヤー | ファイル                  | 備考                                         |
| -------- | ------------------------- | -------------------------------------------- |
| api      | `deleteCollection.api.ts` | `supabase.from("collections").delete().eq()` |
| hooks    | `useDeleteCollection.ts`  | useMutation、引数 id、isPending 返却         |
| UI接続   | CollectionDetailScreen    | Alert.alert で確認後 mutate、成功時 router.back() |

**DB**: `collection_links.collection_id` FK に `ON DELETE CASCADE` 適用済み（migration: `20260223091839_add_cascade_delete_collection_links`）。コレクション削除時に collection_links はDBが自動削除。

---

### 機能5: コレクション詳細取得 ✅ 実装済み

**利用箇所**: CollectionDetailScreen

**役割**: 主に**フォールバック用途**。通常フロー（一覧→詳細遷移）では useCollections のキャッシュで十分。必須ではない。

| 取得経路       | 条件                             | データソース              |
| -------------- | -------------------------------- | ------------------------- |
| 主経路         | 一覧画面から遷移、キャッシュ済み | useCollections + find     |
| フォールバック | 直接URL遷移、一覧未ロード        | useCollection（単体取得） |

| レイヤー | ファイル               | 備考                                                                              |
| -------- | ---------------------- | --------------------------------------------------------------------------------- |
| api      | `getCollection.api.ts` | `supabase.from("collections").select("*, collection_links(count)").eq().single()` |
| hooks    | `useCollection.ts`     | useQuery + collectionQueryKeys.detail(id)、enabled: id != null && id !== ""       |
| UI接続   | CollectionDetailScreen | collection = find(collections) ?? detailCollection。ローディング・not_found 表示  |

---

### 機能6: コレクション内リンク一覧取得 ✅ 実装済み

**利用箇所**: CollectionDetailScreen（FlashList の data）

**実装方針**: 専用 API を作らず、既存の `get_user_links` RPC に `p_collection_id` パラメータを追加して拡張。`fetchUserLinks({ collectionId })` で呼び出し、レスポンスは `UserLink[]` のまま `LinkListCard` で表示。

| レイヤー | ファイル                          | 備考                                                            |
| -------- | --------------------------------- | --------------------------------------------------------------- |
| DB       | `get_user_links` RPC              | `p_collection_id UUID DEFAULT NULL` 追加、WHERE句でサブクエリ   |
| api      | `fetchLinks.api.ts`（既存を拡張） | `p_collection_id: collectionId ?? null` を送信                  |
| hooks    | `useCollectionLinks.ts`           | useQuery + collectionQueryKeys.links(collectionId)              |
| UI接続   | CollectionDetailScreen            | useCollectionLinks(collectionId) でリンク取得、ローディング統合 |

**キャッシュ**: `collectionQueryKeys.links(collectionId)` = `["collections", "detail", collectionId, "links"]`。`useAddLinkToCollection` の `onSettled` で自動 invalidate。`linkQueryKeys` とは独立。

---

### 機能7: リンクをコレクションに追加 ✅ 実装済み

**利用箇所**: LinkDetailScreen（CollectionChip タップ）, LinkCreateModal（保存時のコレクション選択）, Swipe UI（将来）

| レイヤー | ファイル                          | 備考                                         |
| -------- | --------------------------------- | -------------------------------------------- |
| api      | `addLinkToCollection.api.ts`      | `supabase.from("collection_links").insert()` |
| hooks    | `useAddLinkToCollection.ts`       | useMutation、引数 `{ collectionId, linkId }` |
| UI接続   | LinkDetailScreen, LinkCreateModal | handleToggleCollection 追加時、保存時        |

**invalidate**: useAddLinkToCollection 実行時に `collectionQueryKeys.links(collectionId)`、`collectionQueryKeys.forLink(linkId)`、`linkQueryKeys.detail(linkId)` を無効化。重複追加時はユニーク制約エラー → 適切なフィードバック。

---

### 機能8: リンクをコレクションから削除 ✅ 実装済み

**利用箇所**: LinkDetailScreen（CollectionChip タップで解除）

| レイヤー | ファイル                          | 備考                                                   |
| -------- | --------------------------------- | ------------------------------------------------------ |
| api      | `removeLinkFromCollection.api.ts` | `supabase.from("collection_links").delete().eq().eq()` |
| hooks    | `useRemoveLinkFromCollection.ts`  | useMutation、引数 `{ collectionId, linkId }`           |
| UI接続   | LinkDetailScreen                  | handleToggleCollection 削除時                          |

**invalidate**: useRemoveLinkFromCollection 実行時に `collectionQueryKeys.links(collectionId)`、`collectionQueryKeys.forLink(linkId)`、`linkQueryKeys.detail(linkId)` を無効化。楽観的更新（onMutate）とロールバック（onError）を実装。

---

### LinkCreateModal 保存フロー（機能7との連携）✅ 実装済み

1. useCreateLink().createLinkAsync(url) でリンク作成
2. レスポンスの link_id を取得
3. selectedCollectionIds の各 ID に対して addLinkToCollectionAsync({ collectionId, linkId })
4. 全成功後に Alert 表示とモーダルを閉じる

---

### 機能9: リンクに紐づくコレクション一覧取得（リンク詳細用）✅ 実装済み

**利用箇所**: LinkDetailScreen（このリンクが属するコレクションを表示・トグル）

| レイヤー | ファイル                          | 備考                                                                                          |
| -------- | --------------------------------- | --------------------------------------------------------------------------------------------- |
| api      | `fetchCollectionIdsByLink.api.ts` | collection_links から link_id で collection_id 一覧を取得                                     |
| hooks    | `useCollectionsForLink.ts`        | useQuery + collectionQueryKeys.forLink(linkId)、結果を Set で返す                             |
| UI接続   | LinkDetailScreen                  | linkedCollectionIds をサーバーデータに差し替え、CollectionsSectionSkeleton でローディング表示 |

**実装方針**: 専用 API `fetchCollectionIdsByLink` を採用。useCollections で全コレクション一覧を取得し、useCollectionsForLink で紐づく ID を取得してクライアントでマージ。useAddLinkToCollection の楽観的更新・invalidate で collectionQueryKeys.forLink(linkId) を更新。

---

## 実装順序と依存関係

```text
共通基盤 ✅
    ↓
機能1: コレクション作成 ✅
    ↓
機能2: コレクション一覧取得 ✅
    ↓
機能5: コレクション詳細取得 ✅
    ↓
機能7: リンクをコレクションに追加 ✅
    ↓
機能9: リンクに紐づくコレクション一覧取得 ✅
    ↓
機能6: コレクション内リンク一覧取得 ✅
機能8: リンクをコレクションから削除 ✅
機能3: コレクション編集 ✅
機能4: コレクション削除 ✅
```

**推奨実装順**:

1. 機能1: 作成 → CollectionCreateModal
2. 機能2: 一覧取得 → CollectionListScreen, CollectionsLane, LinkDetailScreen 等
3. 機能5: 詳細取得（フォールバック）→ CollectionDetailScreen ヘッダー ✅
4. 機能3 + 4: 編集・削除 → CollectionDetailScreen 内の CollectionEditModal, Delete メニュー
5. 機能6: コレクション内リンク → CollectionDetailScreen
6. 機能7 + 8 + 9: リンク連携 → LinkDetailScreen, LinkCreateModal

---

## クイックリファレンス

| 機能                 | API                                | Hook                          | 主なUI                                |
| -------------------- | ---------------------------------- | ----------------------------- | ------------------------------------- |
| 作成                 | `createCollection`                 | `useCreateCollection`         | CollectionCreateModal                 |
| 一覧取得             | `fetchCollections`                 | `useCollections`              | CollectionListScreen, CollectionsLane |
| 編集                 | `updateCollection`                 | `useUpdateCollection`         | CollectionEditModal                   |
| 削除                 | `deleteCollection`                 | `useDeleteCollection`         | CollectionDetailScreen                |
| 詳細取得             | `getCollection`                    | `useCollection`               | CollectionDetailScreen                |
| コレクション内リンク | `fetchUserLinks({ collectionId })` | `useCollectionLinks`          | CollectionDetailScreen                |
| リンク追加           | `addLinkToCollection`              | `useAddLinkToCollection`      | LinkDetailScreen, LinkCreateModal     |
| リンク削除           | `removeLinkFromCollection`         | `useRemoveLinkFromCollection` | LinkDetailScreen                      |
| リンク別コレクション | `fetchCollectionIdsByLink`         | `useCollectionsForLink`       | LinkDetailScreen                      |
