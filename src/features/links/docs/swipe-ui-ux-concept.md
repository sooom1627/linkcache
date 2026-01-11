# SwipeScreen UX & Business Concept (The "Juice" Spec)

**最終更新日:** 2024-12-19  
**実装状況:** 部分実装（基本機能のみ）

## 実装済み機能

- ✅ **基本UI**: Inbox状態のリンクを1件表示し、ボタンでステータス更新
  - 実装: [`SwipeTriageScreen`](../../screens/SwipeTriageScreen.tsx)
  - 統合: [`app/(protected)/(tabs)/swipes.tsx`](<../../../../app/(protected)/(tabs)/swipes.tsx>)
- ✅ **データ取得とステータス更新**: `useSwipeTriage`フック
  - 実装: [`useSwipeTriage`](../../hooks/useSwipeTriage.ts)
  - API: [`updateLinkStatus`](../../api/updateLinkStatus.api.ts)
- ✅ **Read Soon（右）アクション**: `read_soon`ステータスへの更新
- ✅ **Later（左）アクション**: `later`ステータスへの更新
- ✅ **Inbox Zero状態**: 空状態の表示
- ✅ **ローディング・エラー状態**: 基本的な状態管理

## 実装の詳細

### 使用方法

```tsx
import { SwipeTriageScreen } from "@/src/features/links/screens";

// 画面コンポーネントとして使用
<SwipeTriageScreen />;
```

### フックの使用例

```tsx
import { useSwipeTriage } from "@/src/features/links/hooks/useSwipeTriage";

const {
  currentLink, // 現在表示中のリンク（nullの場合はInbox Zero）
  isLoading, // ローディング状態
  error, // エラー状態
  isUpdating, // 更新処理中
  handleSwipeRight, // Read Soonアクション
  handleSwipeLeft, // Laterアクション
} = useSwipeTriage();
```

### 統合ポイント

- **画面コンポーネント**: [`src/features/links/screens/SwipeTriageScreen.tsx`](../../screens/SwipeTriageScreen.tsx)
- **ビジネスロジック**: [`src/features/links/hooks/useSwipeTriage.ts`](../../hooks/useSwipeTriage.ts)
- **API層**: [`src/features/links/api/updateLinkStatus.api.ts`](../../api/updateLinkStatus.api.ts)
- **ルーティング**: [`app/(protected)/(tabs)/swipes.tsx`](<../../../../app/(protected)/(tabs)/swipes.tsx>)

---

## 1. Core Philosophy: "Active Triage"

この機能の核心は、単なる「整理作業」ではなく、ユーザーが自分の情報摂取をコントロールしているという**自己効力感（Self-Efficacy）**を感じさせることです。

- **From:** "Passive Hoarding"（とりあえず保存して、未読が溜まる罪悪感）
- **To:** "Active Triage"（自分の意思で選別し、前進している感覚）

**Business Goal:**
ユーザーの「意思決定疲れ（Decision Fatigue）」を軽減し、アプリを開くたびに「未読の山」ではなく「整理された思考」を提供する。

## 2. 現在の実装

現在の実装では、基本的なトリアージ機能を提供しています：

- **ボタンベースの操作**: 左右のボタンでステータスを更新
- **即座のフィードバック**: 操作後、カードが消え、次のリンクが表示される（またはInbox Zero状態）
- **状態管理**: React Queryを使用した楽観的更新とキャッシュ無効化

### 実装の動作フロー

1. `useSwipeTriage`がInbox状態のリンクを1件取得
2. ユーザーがボタンを押すと`handleSwipeRight`または`handleSwipeLeft`が呼ばれる
3. `updateLinkStatus` APIでステータスを更新
4. 成功後、キャッシュを無効化して再取得
5. 次のリンクが自動的に表示される（またはInbox Zero状態）

## 3. 実装の制限事項

現在の実装では以下の機能は未実装です：

- **スワイプジェスチャー**: 現在はボタン操作のみ（実装予定: [ロードマップ](./swipe-triage-implementation-roadmap.md) Step 2）
- **視覚的フィードバック**: カードの傾き、色の変化、アイコンの表示など（実装予定: Step 3）
- **スタック表示**: 複数カードの重ね表示（実装予定: Step 4）
- **Undo機能**: 操作の取り消し（実装予定: Step 5）

---

## Concept / 未実装

以下の機能は概念として設計されていますが、まだ実装されていません。詳細は[実装ロードマップ](./swipe-triage-implementation-roadmap.md)を参照してください。

### The "Juice" (手触りと快感)

"Juice"とは、インタラクションに対する豊かで満足感のあるフィードバックのことです。操作自体を楽しくすることで、面倒な「整理」をエンターテインメントに昇華させます。

#### 視覚的フィードバック (Visual Feedback)

- （未実装）**Stack Effect:** 「まだ後ろに控えている」ことを可視化し、作業の全体量と進捗を直感的に伝える。
- （未実装）**Interpolation:** 指の動きに合わせてリアルタイムにカードが傾き、色が変わり、アイコンが出現する。「自分の操作がシステムに伝わっている」というダイレクトな感覚。
- （未実装）**Completion Celebration:** "Completed"（上スワイプ）時の虹色/金色エフェクトや紙吹雪(Confetti)は、学習完了という「小さな勝利」を最大化する演出。

#### 触覚・聴覚フィードバック (Haptic & Audio)

- （未実装）**Threshold Snap:** 閾値を超えた瞬間の「カチッ」というHaptic（`ImpactStyle.Light`）は、決定の確定を指先に伝える。
- （未実装）**Success Tone:** リリース時の肯定的な効果音は、完了の満足感を高める。

### Interaction Design Principles

#### A. Zero-Gravity & Tempo (無重力とテンポ)

- （未実装）**Flow:** 思考を中断させないスムーズなアニメーション。
- （未実装）**Speed:** 判断から実行までのラグを極限までなくす。ユーザーが「パン、パン、パン」とリズムよく処理できること。

#### B. Safety & Trust (安心感)

高速で操作するUIには「誤操作」がつきものです。システムへの信頼を担保するために、以下のUXが必須です。

- （未実装）**Undo is Mandatory:** 「間違えた！」と思った瞬間に戻せること。確認ダイアログを出さずに即座に実行し、Undoで救済する設計（Optimistic UI + Revert）が、テンポと安心感を両立させる。
- （未実装）**Visual Confidence:** 2枚目、3枚目のカードがチラ見えしていることで、「次に来るもの」を予測でき、心理的な準備ができる。

## 4. 方向のメタファー（実装済み）

現在実装されている方向のメタファー：

| 方向         | Action        | 実装状況 | 説明                                                             |
| :----------- | :------------ | :------- | :--------------------------------------------------------------- |
| **Right** 👉 | **Read Soon** | ✅ 実装  | 「確保」「手元に置く」<br>「これは読むぞ」という積極的な選択。   |
| **Left** 👈  | **Later**     | ✅ 実装  | 「倉庫へ」「視界から外す」<br>「今はいいや」というノイズの除去。 |

### 未実装の方向

| 方向      | Action        | 実装状況  | 説明                                                                                                                                      |
| :-------- | :------------ | :-------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| **Up** 👆 | **Completed** | ❌ 未実装 | 「昇華」「完了」<br>「読み終わった！」「レベルアップ！」<br>（実装予定: [ロードマップ](./swipe-triage-implementation-roadmap.md) Step 3） |

## 5. The "Inbox Zero" Moment（実装済み）

Inboxが空になった瞬間の表示は実装済みです。

- ✅ **Empty State表示**: "🎉 Inbox Zero!" メッセージと "All caught up!" テキストを表示
- ✅ **実装場所**: [`SwipeTriageScreen`](../../screens/SwipeTriageScreen.tsx) の40-48行目

### 未実装の機能

- （未実装）**Call to Action:** 空になった状態で放置せず、「Read Soonリストを読む」という次のポジティブなアクションへ自然に誘導する。
