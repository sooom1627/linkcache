# Collections UI レイヤー リファクタリング案

> **最終更新**: 2026年2月15日  
> **前提**: [collections-ui-gap-analysis.md](./collections-ui-gap-analysis.md) のモック実装をベースに、共通化・ベストプラクティス準拠を整理する。  
> **参照**: building-native-ui, vercel-react-native-skills, react-native-expo-architecture, simplicity-first-design

## 📋 目次

1. [現状分析](#1-現状分析)
2. [リファクタリング方針](#2-リファクタリング方針)
3. [共通化候補の評価](#3-共通化候補の評価)
4. [実施項目一覧](#4-実施項目一覧)
5. [実施順序と優先度](#5-実施順序と優先度)
6. [参照ガイドライン](#6-参照ガイドライン)

---

## 1. 現状分析

### 1.1 モック実装の特徴

モック実装では「動くこと」を優先し、以下の傾向がある。

| 傾向                       | 具体例                                                                                    |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| **重複レイアウト**         | CollectionCreateModal と CollectionEditModal の「Collection Identity」フォームがほぼ同一  |
| **類似パターンの個別実装** | 空状態（CollectionDetailScreen, CollectionListScreen, LinkListEmpty）が似た構造で個別実装 |
| **コンポーネント混在**     | TouchableOpacity と Pressable が混在（vercel-react-native-skills は Pressable 推奨）      |
| **定数の分散**             | `CARD_STYLE`, `mockCollections` が複数ファイルに分散                                      |
| **メニュー実装**           | ToggleMenu（BlurView）をカスタム実装。zeego 等のネイティブメニューは未採用                |

### 1.2 既存の共通コンポーネント

| コンポーネント             | 用途                       | 状態                                        |
| -------------------------- | -------------------------- | ------------------------------------------- |
| `ToggleMenu`               | 汎用ドロップダウンメニュー | ✅ 共有済み（LinkDetail, CollectionDetail） |
| `FormButton` / `FormInput` | フォーム要素               | ✅ 共有済み                                 |
| `BaseBottomSheetModal`     | モーダル基盤               | ✅ 共有済み                                 |
| `ModalHeader`              | モーダルヘッダー           | ✅ 共有済み                                 |
| `ErrorStateView`           | エラー表示                 | ✅ 共有済み（空状態とは別パターン）         |

---

## 2. リファクタリング方針

### 2.1 基本原則（Simplicity-First）

- **YAGNI**: 現在使わない抽象化は作らない
- **3回ルール**: 共通化は3回以上使う時に検討
- **統合フックの回避**: 分割後に「統合フックが必要になる」分割は避ける
- **実用性重視**: 理論より実装のわかりやすさを優先

### 2.2 参照ガイドライン

| ソース                             | 適用ポイント                                                                                         |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **building-native-ui**             | `borderCurve: 'continuous'`, flex gap, `contentInsetAdjustmentBehavior`, ネイティブモーダル/メニュー |
| **vercel-react-native-skills**     | Pressable 優先, expo-image, リストの memo/コールバック安定化, ネイティブメニュー（zeego）            |
| **react-native-expo-architecture** | Feature 内 components/, shared/ の責務分離, 50–200 行目安                                            |
| **simplicity-first-design**        | 300行超で分割検討, 統合フックの危険信号                                                              |

---

## 3. 共通化候補の評価

### 3.1 Collection Identity フォーム（高優先）

**現状**: CollectionCreateModal と CollectionEditModal で、絵文字ピッカー + 名前入力のレイアウトがほぼ同一（約40行ずつ重複）。

**評価**:

- 使用箇所: 2箇所（Create / Edit）
- 3回ルール: 未達だが、**同一 feature 内で明確に同一UI** → 共通化の正当性あり
- リスク: 低（責務が明確で、props で制御可能）

**提案**: `CollectionIdentityForm` コンポーネントを抽出

```tsx
// src/features/links/components/CollectionIdentityForm.tsx
interface CollectionIdentityFormProps {
  name: string;
  emoji: string;
  onNameChange: (v: string) => void;
  onEmojiChange: (v: string) => void;
  onEmojiPress: () => void;
  namePlaceholder: string;
  emojiLabel: string;
  nameLabel: string;
}
```

**効果**: 重複削減、Create/Edit の UI 一貫性担保が容易に。

---

### 3.2 空状態コンポーネント（中優先）

**現状**: 以下の3パターンが類似構造で個別実装されている。

| 場所                   | アイコン       | タイトル    | 説明              | アクション          |
| ---------------------- | -------------- | ----------- | ----------------- | ------------------- |
| CollectionDetailScreen | FolderOpen     | empty_title | empty_description | なし                |
| CollectionListScreen   | FolderOpen     | empty_title | empty_description | 新規作成ボタン      |
| LinkListEmpty          | Inbox / Filter | 各種        | 各種              | 追加/リセットボタン |

**評価**:

- 使用箇所: 3箇所以上
- 3回ルール: **達成**
- 構造: アイコン + タイトル + 説明 + オプションでアクションボタン

**提案**: `EmptyStateView` を shared に昇格（LinkPasteContainer 内に同名あり → 統合検討）

```tsx
// src/shared/components/EmptyStateView.tsx
interface EmptyStateViewProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
}
```

**注意**: LinkListEmpty の「フィルター時」と「通常時」の2パターンは、呼び出し側で `icon` / `title` / `description` を切り替える形で対応。過度な props 増加は避ける。

---

### 3.3 アクションメニュー（ellipsis + ToggleMenu）パターン（低優先）

**現状**: LinkDetailActionButtonGroup と CollectionDetailScreen で、ellipsis ボタン + ToggleMenu + オーバーレイのパターンが類似。

**評価**:

- 使用箇所: 2箇所
- 3回ルール: 未達
- メニュー項目・位置・z-index が画面ごとに異なる

**提案**: **現時点では共通化しない**。2箇所のみで、画面固有の差異が大きい。将来3箇所目ができた時点で検討。

---

### 3.4 カードスタイル定数（低優先）

**現状**: `CARD_STYLE = { borderCurve: "continuous" }` が CollectionCard と CollectionListScreen で重複。

**評価**:

- 使用箇所: 2箇所
- 共通化の効果: 微小（1行の定数）

**提案**: `src/shared/constants/styles.ts` または `src/features/links/constants/` に `CARD_BORDER_CURVE` を定義して参照。過度な抽象化は不要。

---

### 3.5 ネイティブメニューへの移行（検討）

**現状**: ToggleMenu は BlurView + カスタムアニメーションで実装。vercel-react-native-skills は zeego によるネイティブメニューを推奨。

**評価**:

- メリット: アクセシビリティ、プラットフォーム一貫性
- デメリット: 既存 ToggleMenu の置き換え工数、zeego の導入判断

**提案**: **Phase 3 以降の検討**。現状 ToggleMenu は動作しており、zeego 導入は新規画面や大規模リファクタ時に検討。

---

### 3.6 TouchableOpacity → Pressable 置換（中優先）

**現状**: LinkDetailActionButtonGroup, LinkListEmpty, ErrorStateView, ToggleMenu 内で TouchableOpacity を使用。

**評価**:

- vercel-react-native-skills: Pressable 推奨
- 影響範囲: 複数ファイル

**提案**: 段階的に Pressable へ置換。`activeOpacity` 相当は `style` の関数形式で表現。

---

## 4. 実施項目一覧

### Phase 1: 即効性の高い共通化

| #   | 項目                        | 対象                                                        | 効果             |
| --- | --------------------------- | ----------------------------------------------------------- | ---------------- |
| 1.1 | CollectionIdentityForm 抽出 | CollectionCreateModal, CollectionEditModal                  | 重複約80行削減   |
| 1.2 | EmptyStateView 共通化       | CollectionDetailScreen, CollectionListScreen, LinkListEmpty | 空状態UIの一貫性 |

### Phase 2: ベストプラクティス準拠

| #   | 項目                         | 対象                                                                   | 効果             |
| --- | ---------------------------- | ---------------------------------------------------------------------- | ---------------- |
| 2.1 | TouchableOpacity → Pressable | LinkDetailActionButtonGroup, LinkListEmpty, ErrorStateView, ToggleMenu | ガイドライン準拠 |
| 2.2 | カードスタイル定数の集約     | CollectionCard, CollectionListScreen                                   | 重複削減（軽微） |

### Phase 3: 拡張・最適化（将来検討）

| #   | 項目                           | 備考                         |
| --- | ------------------------------ | ---------------------------- |
| 3.1 | zeego 等ネイティブメニュー導入 | 新規画面や大規模リファクタ時 |
| 3.2 | アクションメニュー共通化       | 3箇所目ができた時点で検討    |

---

## 5. 実施順序と優先度

```text
Phase 1.1: CollectionIdentityForm 抽出
    ↓
Phase 1.2: EmptyStateView 共通化
    ↓
Phase 2.1: TouchableOpacity → Pressable 置換
    ↓
Phase 2.2: カードスタイル定数集約（任意）
```

**推奨**: Phase 1 を先行実施。Phase 2 は既存修正と並行可能。Phase 3 は必要に応じて。

---

## 6. 参照ガイドライン

### 6.1 共通化の判断フロー

```text
1. このUIは3箇所以上で使われるか？ → No: 共通化見送り
2. 同一責務で明確に同じ構造か？ → Yes: 共通化検討
3. 分割後に統合コンポーネントが必要になるか？ → Yes: 分割見送り
4. 抽象化で可読性が下がるか？ → Yes: シンプルな実装を維持
```

### 6.2 ファイル配置ルール

| 種別                | 配置                                                   | 例                     |
| ------------------- | ------------------------------------------------------ | ---------------------- |
| Feature 固有        | `src/features/links/components/`                       | CollectionIdentityForm |
| 複数 Feature で使用 | `src/shared/components/`                               | EmptyStateView         |
| 定数                | `src/shared/constants/` または feature 内 `constants/` | CARD_BORDER_CURVE      |

### 6.3 リストパフォーマンス（vercel-react-native-skills）

- FlashList 使用済み（CollectionDetailScreen）: ✅
- renderItem のコールバック: useCallback で安定化済み
- リストアイテム: プリミティブ props を優先（LinkListCard は `link` オブジェクトを渡しているが、現状許容）

### 6.4 スタイリング（building-native-ui）

- `borderCurve: 'continuous'` を角丸に適用
- flex gap を margin より優先
- `contentInsetAdjustmentBehavior="automatic"` を ScrollView/FlashList に適用

---

## 付録: 実装メモ

### A. CollectionIdentityForm 抽出時の注意

- EmojiPicker は Create/Edit 両方で使用。Form 内に含めるか、親で管理するか検討。
- 現状は「Form は表示のみ、開閉は親で管理」がシンプル。`onEmojiPress` で親に委譲。

### B. EmptyStateView と LinkPasteContainer の EmptyStateView

- LinkPasteContainer 内の `EmptyStateView` は「貼り付けを促す」専用UI。
- 共通 EmptyStateView は「アイコン + タイトル + 説明 + オプションアクション」の汎用パターン。
- 名前の衝突を避けるため、shared のものは `EmptyStateView`、LinkPasteContainer 内は `PastePromptView` 等にリネーム可能。

### C. mockCollections の集約

- 現状: CollectionDetailScreen, CollectionListScreen, LinkCreateModal, CollectionsLane で類似データが分散。
- API 実装後は解消されるため、**UI リファクタでは触れない**。collections-implementation-plan に委譲。
