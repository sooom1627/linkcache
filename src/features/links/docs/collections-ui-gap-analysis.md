# Collections 機能の UI 不足洗い出し

> **最終更新**: 2026年2月15日  
> **スコープ**: 画面・コンポーネント・ナビゲーションのみ（API・フックは含まない）  
> **関連**:
>
> - [Collection定義と利用状況の詳細整理](./collection-definition.md)
> - [UIレイヤー リファクタリング案](./ui-refactoring-plan.md)（モック実装後の共通化・ベストプラクティス準拠）

## 変更履歴

| 日付       | 内容                                                                                                                                                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-02-15 | CollectionDetailScreen に編集・削除メニューを実装。コレクションカード右側の ellipsis から ToggleMenu で Edit/Delete を選択可能。削除は Alert で確認。Edit は CollectionEditModal を開く。翻訳キー（header_edit, header_delete, collection_edit 等）を追加。 |
| 2026-02-15 | CollectionEditModal を新規作成。CollectionCreateModal と UI 統一。Edit 押下で表示。API 連携は未実装。                                                                                                                                                       |
| 2026-02-15 | CollectionsLane の CollectionChip に `router.push(\`/collections/${id}\`)` を実装。mockCollections を共有して CollectionDetailScreen へ遷移。                                                                                                               |

### 2026-02-15 実装詳細

- **配置**: コレクション情報を白背景カード（`rounded-2xl bg-white`）にし、右端に ellipsis ボタンを配置
- **メニュー**: LinkDetailActionButtonGroup と同様の ToggleMenu（BlurView）を使用。FlashList 外でレンダリングし、z-index で LinkListCard より前面に表示
- **Edit**: CollectionEditModal を開く（名前・絵文字の編集フォーム）
- **Delete**: `Alert.alert` で確認ダイアログ。確認後に `router.back()`。コレクション削除 API 実装後に差し替え予定
- **翻訳キー**: `header_edit`, `header_delete`, `header_more_options`, `collection_edit.*`, `delete_confirm.*`（en.json / ja.json）

## 📋 目次

1. [変更履歴](#変更履歴)
2. [既存 UI の状態](#1-既存-ui-の状態)
3. [不足している UI](#2-不足している-ui)
4. [ルーティング](#3-ルーティング)
5. [実装の優先順位](#4-実装の優先順位)

---

## 1. 既存 UI の状態

### 1.1 コンポーネント

| コンポーネント          | パス                                | 状態                                                                                         |
| ----------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------- |
| `CollectionCard`        | `components/CollectionCard.tsx`     | ✅ 実装済み。emoji, title, itemsCount。`href` で Link 遷移（prefetch 対応）、`onPress` も可  |
| `CollectionChip`        | `components/CollectionChip.tsx`     | ✅ 実装済み。emoji, title。選択状態の表示が可能                                              |
| `CollectionCreateModal` | `screens/CollectionCreateModal.tsx` | ✅ 実装済み。名前・絵文字入力フォーム。送信時はモーダルを閉じるのみ                          |
| `CollectionEditModal`   | `screens/CollectionEditModal.tsx`   | ✅ 実装済み。コレクション名・絵文字の編集。CollectionCreateModal と UI 統一。Edit 押下で表示 |

### 1.2 画面・セクション

| 画面/セクション          | パス                                 | 状態                                                                                                                                    |
| ------------------------ | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `LinksOverViewScreen`    | `screens/LinksOverViewScreen.tsx`    | ✅ 実装済み。Status カード、コレクショングリッド、Forgotten Links。モックデータ。遷移実装済み                                           |
| `CollectionListScreen`   | `screens/CollectionListScreen.tsx`   | ✅ 実装済み（UI のみ）。Un Collectioned + コレクション一覧。モックデータ。空状態あり                                                    |
| `CollectionDetailScreen` | `screens/CollectionDetailScreen.tsx` | ✅ 実装済み。コレクション内リンク一覧。FlashList + コレクション詳細ヘッダー（白背景カード + ellipsis メニューで編集・削除）。空状態あり |
| `CollectionsLane`        | `screens/CollectionsLane.tsx`        | ✅ 実装済み。ホーム画面の横スクロール。CollectionChip タップで CollectionDetailScreen へ遷移。mockCollections を共有。                  |
| `LinkDetailScreen`       | `screens/LinkDetailScreen.tsx`       | ✅ 実装済み。コレクションチップで追加・解除 UI。CollectionCreateModal 呼び出し                                                          |
| `LinkCreateModal`        | `screens/LinkCreateModal.tsx`        | ✅ 実装済み。コレクション選択 UI。選択状態のみ保持、保存時は未使用                                                                      |

---

## 2. 不足している UI

### 2.1 画面（Screen）

（なし。CollectionDetailScreen は実装済み）

### 2.2 モーダル・ダイアログ

| UI                          | 説明                                           | 優先度 |
| --------------------------- | ---------------------------------------------- | ------ |
| ~~**CollectionEditModal**~~ | ~~コレクション名・絵文字の編集~~ ✅ 実装済み   | -      |
| **CollectionDeleteConfirm** | コレクション削除の確認（Alert またはモーダル） | 中     |

### 2.3 遷移の未実装

| 場所                              | 現状                              | 必要な対応                    |
| --------------------------------- | --------------------------------- | ----------------------------- |
| CollectionsLane の CollectionChip | ~~`onPress` が TODO~~ ✅ 実装済み | CollectionDetailScreen へ遷移 |

### 2.4 その他

| UI                                | 説明                                                                                      | 優先度 |
| --------------------------------- | ----------------------------------------------------------------------------------------- | ------ |
| **CollectionDetailScreen**        | ~~編集・削除ボタン~~ ✅ 実装済み。白背景カード右側の ellipsis → ToggleMenu（Edit/Delete） | -      |
| **空状態**                        | ~~CollectionDetailScreen（リンク 0 件）~~ ✅ 実装済み。CollectionListScreen も実装済み    | -      |
| **Swipe UI でのコレクション選択** | 「Read Soon」または特定コレクションへ振り分け                                             | 中     |

---

## 3. ルーティング

### 3.1 実装済みルート

```text
app/(protected)/
├── collections/
│   ├── _layout.tsx
│   ├── index.tsx          # CollectionListScreen
│   └── [id].tsx           # CollectionDetailScreen（本実装）
└── links/
    └── un-collectioned.tsx # コレクション未所属リンク一覧（プレースホルダー）
```

### 3.2 遷移パス

| 遷移元                                   | 遷移先                 | パス例                   | 状態                            |
| ---------------------------------------- | ---------------------- | ------------------------ | ------------------------------- |
| LinksOverViewScreen「すべて表示」        | CollectionListScreen   | `/collections`           | ✅ 実装済み                     |
| CollectionCard タップ                    | CollectionDetailScreen | `/collections/[id]`      | ✅ 実装済み                     |
| CollectionsLane の CollectionChip タップ | CollectionDetailScreen | `/collections/[id]`      | ✅ 実装済み                     |
| 「Un Collectioned」タップ                | 未所属リンク一覧       | `/links/un-collectioned` | ✅ 実装済み（プレースホルダー） |

---

## 4. 実装の優先順位

### Phase 1（必須）

1. ~~**CollectionListScreen** の作成~~ ✅ 完了（UI のみ、モックデータ）
2. ~~**CollectionDetailScreen** の実装~~ ✅ 完了（FlashList、コレクション詳細ヘッダー、空状態）
3. ~~**ルート追加**（`app/(protected)/collections/`）~~ ✅ 完了
4. ~~**既存 UI からの遷移実装**（「すべて表示」、CollectionCard）~~ ✅ 完了
5. ~~**CollectionsLane の CollectionChip** から CollectionDetailScreen への遷移~~ ✅ 完了

### Phase 2（重要）

1. ~~**CollectionEditModal**~~ ✅ 完了（Edit 押下で表示。API 連携は未実装）
2. ~~**CollectionDeleteConfirm**~~ ✅ 一部完了（Alert で確認ダイアログ実装。API 連携は未実装）
3. ~~**CollectionDetailScreen のヘッダーアクション**（編集・削除）~~ ✅ 完了
4. ~~**空状態 UI**（CollectionDetailScreen のリンク 0 件時）~~ ✅ 完了

### Phase 3（拡張）

1. **「Un Collectioned」専用画面** の本実装（現状プレースホルダー）
2. **Swipe UI でのコレクション選択**
