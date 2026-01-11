# SwipeScreen UX & Business Concept (The "Juice" Spec)

## 1. Core Philosophy: "Active Triage"

この機能の核心は、単なる「整理作業」ではなく、ユーザーが自分の情報摂取をコントロールしているという**自己効力感（Self-Efficacy）**を感じさせることです。

- **From:** "Passive Hoarding"（とりあえず保存して、未読が溜まる罪悪感）
- **To:** "Active Triage"（自分の意思で選別し、前進している感覚）

**Business Goal:**
ユーザーの「意思決定疲れ（Decision Fatigue）」を軽減し、アプリを開くたびに「未読の山」ではなく「整理された思考」を提供する。

## 2. The "Juice" (手触りと快感)

"Juice"とは、インタラクションに対する豊かで満足感のあるフィードバックのことです。操作自体を楽しくすることで、面倒な「整理」をエンターテインメントに昇華させます。

### 視覚的フィードバック (Visual Feedback)

- **Stack Effect:** 「まだ後ろに控えている」ことを可視化し、作業の全体量と進捗を直感的に伝える。
- **Interpolation:** 指の動きに合わせてリアルタイムにカードが傾き、色が変わり、アイコンが出現する。「自分の操作がシステムに伝わっている」というダイレクトな感覚。
- **Completion Celebration:** "Completed"（上スワイプ）時の虹色/金色エフェクトや紙吹雪(Confetti)は、学習完了という「小さな勝利」を最大化する演出。

### 触覚・聴覚フィードバック (Haptic & Audio)

- **Threshold Snap:** 閾値を超えた瞬間の「カチッ」というHaptic（`ImpactStyle.Light`）は、決定の確定を指先に伝える。
- **Success Tone:** リリース時の肯定的な効果音は、完了の満足感を高める。

## 3. Interaction Design Principles

### A. Zero-Gravity & Tempo (無重力とテンポ)

- **Flow:** 思考を中断させないスムーズなアニメーション。
- **Speed:** 判断から実行までのラグを極限までなくす。ユーザーが「パン、パン、パン」とリズムよく処理できること。

### B. Safety & Trust (安心感)

高速で操作するUIには「誤操作」がつきものです。システムへの信頼を担保するために、以下のUXが必須です。

- **Undo is Mandatory:** 「間違えた！」と思った瞬間に戻せること。確認ダイアログを出さずに即座に実行し、Undoで救済する設計（Optimistic UI + Revert）が、テンポと安心感を両立させる。
- **Visual Confidence:** 2枚目、3枚目のカードがチラ見えしていることで、「次に来るもの」を予測でき、心理的な準備ができる。

## 4. Metaphor of Directions (方向のメタファー)

| 方向         | Action        | Metaphor                   | Emotion                                                        |
| :----------- | :------------ | :------------------------- | :------------------------------------------------------------- |
| **Right** 👉 | **Read Soon** | 「確保」「手元に置く」     | **Interest (興味)**<br>「これは読むぞ」という積極的な選択。    |
| **Left** 👈  | **Later**     | 「倉庫へ」「視界から外す」 | **Postpone (保留)**<br>「今はいいや」というノイズの除去。      |
| **Up** 👆    | **Completed** | 「昇華」「完了」           | **Achievement (達成)**<br>「読み終わった！」「レベルアップ！」 |

## 5. The "Inbox Zero" Moment

Inboxが空になった瞬間は、アプリ体験のクライマックスです。

- **Psychological Reward:** "All Caught Up!"（すべて完了）のメッセージは、ユーザーに休息と達成感を与える。
- **Call to Action:** 空になった状態で放置せず、「Read Soonリストを読む」という次のポジティブなアクションへ自然に誘導する。
