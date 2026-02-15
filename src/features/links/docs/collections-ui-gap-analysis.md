# Collections 機能の UI 不足洗い出し

> **最終更新**: 2026年2月15日  
> **スコープ**: 画面・コンポーネント・ナビゲーションのみ（API・フックは含まない）  
> **関連**: [Collection定義と利用状況の詳細整理](./collection-definition.md)

## 📋 目次

1. [既存 UI の状態](#1-既存-ui-の状態)
2. [不足している UI](#2-不足している-ui)
3. [ルーティング](#3-ルーティング)
4. [実装の優先順位](#4-実装の優先順位)

---

## 1. 既存 UI の状態

### 1.1 コンポーネント

| コンポーネント          | パス                                | 状態                                                                                        |
| ----------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `CollectionCard`        | `components/CollectionCard.tsx`     | ✅ 実装済み。emoji, title, itemsCount。`href` で Link 遷移（prefetch 対応）、`onPress` も可 |
| `CollectionChip`        | `components/CollectionChip.tsx`     | ✅ 実装済み。emoji, title。選択状態の表示が可能                                             |
| `CollectionCreateModal` | `screens/CollectionCreateModal.tsx` | ✅ 実装済み。名前・絵文字入力フォーム。送信時はモーダルを閉じるのみ                         |

### 1.2 画面・セクション

| 画面/セクション        | パス                               | 状態                                                                                          |
| ---------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------- |
| `LinksOverViewScreen`  | `screens/LinksOverViewScreen.tsx`  | ✅ 実装済み。Status カード、コレクショングリッド、Forgotten Links。モックデータ。遷移実装済み |
| `CollectionListScreen` | `screens/CollectionListScreen.tsx` | ✅ 実装済み（UI のみ）。Un Collectioned + コレクション一覧。モックデータ。空状態あり          |
| `CollectionsLane`      | `screens/CollectionsLane.tsx`      | ✅ 実装済み。ホーム画面の横スクロール。CollectionChip を表示                                  |
| `LinkDetailScreen`     | `screens/LinkDetailScreen.tsx`     | ✅ 実装済み。コレクションチップで追加・解除 UI。CollectionCreateModal 呼び出し                |
| `LinkCreateModal`      | `screens/LinkCreateModal.tsx`      | ✅ 実装済み。コレクション選択 UI。選択状態のみ保持、保存時は未使用                            |

---

## 2. 不足している UI

### 2.1 画面（Screen）

| 画面                       | 説明                                                                                               | 優先度 |
| -------------------------- | -------------------------------------------------------------------------------------------------- | ------ |
| **CollectionDetailScreen** | コレクション内リンク一覧。CollectionCard / CollectionChip タップ時の遷移先。現状はプレースホルダー | 高     |

### 2.2 モーダル・ダイアログ

| UI                          | 説明                                           | 優先度 |
| --------------------------- | ---------------------------------------------- | ------ |
| **CollectionEditModal**     | コレクション名・絵文字の編集                   | 中     |
| **CollectionDeleteConfirm** | コレクション削除の確認（Alert またはモーダル） | 中     |

### 2.3 遷移の未実装

| 場所                              | 現状              | 必要な対応                    |
| --------------------------------- | ----------------- | ----------------------------- |
| CollectionsLane の CollectionChip | `onPress` が TODO | CollectionDetailScreen へ遷移 |

### 2.4 その他

| UI                                    | 説明                                                                             | 優先度 |
| ------------------------------------- | -------------------------------------------------------------------------------- | ------ |
| **CollectionDetailScreen のヘッダー** | 編集・削除ボタン                                                                 | 中     |
| **空状態**                            | CollectionDetailScreen（リンク 0 件）のみ未実装。CollectionListScreen は実装済み | 中     |
| **Swipe UI でのコレクション選択**     | 「Read Soon」または特定コレクションへ振り分け                                    | 中     |

---

## 3. ルーティング

### 3.1 実装済みルート

```
app/(protected)/
├── collections/
│   ├── _layout.tsx
│   ├── index.tsx          # CollectionListScreen
│   └── [id].tsx           # CollectionDetailScreen（プレースホルダー）
└── links/
    └── un-collectioned.tsx # コレクション未所属リンク一覧（プレースホルダー）
```

### 3.2 遷移パス

| 遷移元                            | 遷移先                 | パス例                   | 状態                            |
| --------------------------------- | ---------------------- | ------------------------ | ------------------------------- |
| LinksOverViewScreen「すべて表示」 | CollectionListScreen   | `/collections`           | ✅ 実装済み                     |
| CollectionCard タップ             | CollectionDetailScreen | `/collections/[id]`      | ✅ 実装済み（プレースホルダー） |
| 「Un Collectioned」タップ         | 未所属リンク一覧       | `/links/un-collectioned` | ✅ 実装済み（プレースホルダー） |

---

## 4. 実装の優先順位

### Phase 1（必須）

1. ~~**CollectionListScreen** の作成~~ ✅ 完了（UI のみ、モックデータ）
2. **CollectionDetailScreen** の実装（現状プレースホルダー）
3. ~~**ルート追加**（`app/(protected)/collections/`）~~ ✅ 完了
4. ~~**既存 UI からの遷移実装**（「すべて表示」、CollectionCard）~~ ✅ 完了
5. **CollectionsLane の CollectionChip** から CollectionDetailScreen への遷移

### Phase 2（重要）

1. **CollectionEditModal**
2. **CollectionDeleteConfirm**
3. **CollectionDetailScreen のヘッダーアクション**（編集・削除）
4. **空状態 UI**（CollectionDetailScreen のリンク 0 件時）

### Phase 3（拡張）

1. **「Un Collectioned」専用画面** の本実装（現状プレースホルダー）
2. **Swipe UI でのコレクション選択**
