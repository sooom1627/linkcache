# US-A: Growth Dashboard 7 日系列（`daily_totals`）

**ストーリー**: ユーザーとして、Growth Dashboard の週次チャートに **RPC `get_dashboard_overview` の `daily_totals`**（7 日の added / read）を表示したい。内訳系列（コレクション／ドメイン）は本ストーリーではモックのまま。

一次情報: [dashboard-overview-api.md](./dashboard-overview-api.md) · ストーリー対応: [dashboard-overview-user-stories-execution-plan.md](./dashboard-overview-user-stories-execution-plan.md)

| 項目                                 | 内容                                                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **推奨実行順**                       | 下記 **T1 → T9**（依存があるため順序を崩さない）                                                                         |
| **1 タスクあたりの完了定義**         | 各タスク末尾の **DoD** を満たすこと                                                                                      |
| **スプリント完了（ストーリー DoD）** | [§ ストーリー完了定義](#ストーリー完了定義story-dod)                                                                     |
| **T1〜T6 実装**                      | **完了**（一覧・パスは [§5](#5-実装済みt1t6サマリ)；T6 のチェックリストは [§6](#6-実行計画タスク--サブタスク) の T6 節） |

---

## 1. スコープ / 非スコープ

| IN                                                                                   | OUT                                                                     |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `daily_totals` の **7 日系列**をチャートに表示                                       | `daily_by_collection` / `daily_by_domain` の実データ（**US-B / US-C**） |
| `api/` + Zod + React Query + `useDashboardOverviewData` の **added/read 系列**の置換 | エラー UI・再試行・**RefreshControl**（**US-X**）                       |
| 7 日すべて 0 の **空／ゼロ表示**                                                     | 内訳テーブル実データ・`extractDomain` SQL 同値（**US-C**）              |

---

## 2. 事前読了（T7 以降の着手前）

1. [§1.1 現行スキーマ](dashboard-overview-api.md#11-現行スキーママイグレーション実装rpc-設計前の突合せ)
2. [§2 プロダクト定義](dashboard-overview-api.md#2-プロダクト定義方針--db-突合せ後に-rpc-で確定)
3. [§10 層の安全順](dashboard-overview-api.md#10-このドキュメントについて)

参照 Skills: [native-data-fetching](../../.cursor/skills/native-data-fetching/SKILL.md)、[supabase-postgres-best-practices](../../.cursor/skills/supabase-postgres-best-practices/SKILL.md)、[vercel-react-native-skills](../../.cursor/skills/vercel-react-native-skills/SKILL.md)、[building-native-ui](../../.cursor/skills/building-native-ui/SKILL.md)。

---

## 3. RPC 契約（確定・参照）

**実装**: [§5](#5-実装済みt1t6サマリ)。T7 以降の取り込みでも次表を正とする（集計の正本は [dashboard-overview-api.md §2](./dashboard-overview-api.md#2-プロダクト定義方針--db-突合せ後に-rpc-で確定)）。

| 項目           | 内容                                                                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 関数名         | `get_dashboard_overview(p_tz text)`                                                                                                |
| 認証           | `auth.uid()` 必須。`SECURITY DEFINER` + `search_path` 固定（既存 `get_user_links` と同パターン）                                   |
| 戻り           | `json` 1 件                                                                                                                        |
| `daily_totals` | 長さ **7**。**index 0 ＝ 6 日前**、**6 ＝ 今日**（[`getLocalWeekWindowDates`](../../src/shared/utils/weekRangeDisplay.ts) と一致） |
| 各行           | `{ "date": "YYYY-MM-DD", "added_count": number, "read_count": number }`                                                            |
| US-B/C 用キー  | `daily_by_collection` / `daily_by_domain` は **`[]`** で同梱                                                                       |

集計: 正本 §2 — 追加は `link_status.created_at`、読了は `read_at IS NOT NULL` の暦日、日境界は `p_tz`（IANA）。

---

## 4. DB マイグレーション（T1〜T2・済）

リポジトリ DDL: [`20260322000000_get_dashboard_overview.sql`](../../supabase/migrations/20260322000000_get_dashboard_overview.sql)。**新規適用手順**（MCP・`project_id` 等）は [dashboard-overview-api.md](./dashboard-overview-api.md) の層の安全順・運用に従う（本ストーリーではリモート適用済み）。

---

## 5. 実装済み（T1〜T6）サマリ

**最終確認目安**: 2026-03-22 — `pnpm run check` / `pnpm test` 通過を前提とする。

| 範囲              | コード（代表）                                                                                                                                                                                                                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| T1〜T3（RPC・型） | 上記マイグレーション、[`supabase.types.ts`](../../src/features/links/types/supabase.types.ts) の `get_dashboard_overview`                                                                                                                                                                                                |
| T4（API）         | [`fetchDashboardOverview.api.ts`](../../src/features/links/api/fetchDashboardOverview.api.ts)、[`fetchDashboardOverview.api.test.ts`](../../src/features/links/__tests__/api/fetchDashboardOverview.api.test.ts)                                                                                                         |
| T5（React Query） | [`queryKeys.ts`](../../src/features/links/constants/queryKeys.ts)（`linkQueryKeys.dashboardOverview`）、[`useDashboardOverviewQuery.ts`](../../src/features/links/hooks/useDashboardOverviewQuery.ts)、[`useDashboardOverviewQuery.test.ts`](../../src/features/links/__tests__/hooks/useDashboardOverviewQuery.test.ts) |
| T6（データ合成）  | [`useDashboardOverviewData.ts`](../../src/features/links/hooks/useDashboardOverviewData.ts)（チャートの `addedByDay` / `readByDay` を `useDashboardOverviewQuery` の `daily_totals` に接続）、[`useDashboardOverviewData.test.ts`](../../src/features/links/__tests__/hooks/useDashboardOverviewData.test.ts)            |

**未対応（画面・キャッシュ）**: ダッシュ専用クエリの **loading / エラー UI の画面合成**は **T8 / US-X**。[`dashboardOverview.fixtures.ts`](../../src/features/links/testing/dashboardOverview.fixtures.ts) は既定ゼロ列のまま（T6 で変更なし）。T7 の invalidate はプレフィックス `["links","dashboard","overview"]` を利用。

**フォローアップ（US-A 全体・未）**: [dashboard-overview-api.md §3.1](./dashboard-overview-api.md#31-カテゴリ別チェックリストskill-準拠) の **`EXPLAIN (ANALYZE, BUFFERS)`**（データ量に応じて）。`links/api` の `getUser()` 統一は [issue #104](https://github.com/sooom1627/linkcache/issues/104)。

---

## 6. 実行計画（タスク / サブタスク）

### T1〜T5（完了）

**状態**: 完了。パス・役割は [§5](#5-実装済みt1t6サマリ) の表を正とする（サブタスクの詳細チェックリストは省略）。

---

### T6 — `useDashboardOverviewData` の系列接続

**状態**: 完了。

|            |                                                                                                                                                                                                                                     |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **目的**   | チャート用の `addedByDay` / `readByDay` を **RPC の系列**に差し替える。                                                                                                                                                             |
| **依存**   | T5 完了                                                                                                                                                                                                                             |
| **成果物** | [`useDashboardOverviewData.ts`](../../src/features/links/hooks/useDashboardOverviewData.ts)、[`useDashboardOverviewData.test.ts`](../../src/features/links/__tests__/hooks/useDashboardOverviewData.test.ts)（fixtures は変更なし） |

- [x] `addedByDay` / `readByDay` のみ T5 のデータを使用する
- [x] コレクション／ドメインの行列は **従来どおり** `mockAddedByDay` / `mockReadByDay` + `splitDayTotalAcrossBuckets` のままにする
- [x] fixture / モック日付が §3 の窓と矛盾しないよう更新する（既定の 7 日ゼロ列で整合、追加更新なし）

**DoD**: データ層だけ見て、週 7 日の合計が RPC の `daily_totals` と一致する（[`useDashboardOverviewData.test.ts`](../../src/features/links/__tests__/hooks/useDashboardOverviewData.test.ts) で検証）。

---

### T7 — キャッシュ無効化（mutation 横断）

|            |                                                                      |
| ---------- | -------------------------------------------------------------------- |
| **目的**   | リンク／コレクション操作後にダッシュボードが古くならないようにする。 |
| **依存**   | T5 完了（T6 と並行可だが、invalidate は queryKey 必須のため T5 後）  |
| **成果物** | 各 mutation フック + 該当 `__tests__`                                |

各フックで `queryClient.invalidateQueries` に `linkQueryKeys.dashboardOverview` のプレフィックスを追加する。

- [ ] [`useCreateLink.ts`](../../src/features/links/hooks/useCreateLink.ts)
- [ ] [`useDeleteLink.ts`](../../src/features/links/hooks/useDeleteLink.ts)
- [ ] [`useUpdateLinkReadStatus.ts`](../../src/features/links/hooks/useUpdateLinkReadStatus.ts)
- [ ] [`useSwipeCards.ts`](../../src/features/links/hooks/useSwipeCards.ts)
- [ ] [`useAddLinkToCollection.ts`](../../src/features/links/hooks/useAddLinkToCollection.ts)
- [ ] [`useRemoveLinkFromCollection.ts`](../../src/features/links/hooks/useRemoveLinkFromCollection.ts)
- [ ] [`useCreateCollection.ts`](../../src/features/links/hooks/useCreateCollection.ts)
- [ ] [`useUpdateCollection.ts`](../../src/features/links/hooks/useUpdateCollection.ts)
- [ ] [`useDeleteCollection.ts`](../../src/features/links/hooks/useDeleteCollection.ts)
- [ ] 変更した各フックのテストで invalidate が期待どおりか確認する（既存パターンに合わせる）

**DoD**: 上記すべてにチェック。関連テストが緑。

---

### T8 — 画面・チャート UI

|            |                                                                                                                                                                                                                                                                                                    |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **目的**   | ユーザーに系列とローディング・空表示を見せる。                                                                                                                                                                                                                                                     |
| **依存**   | T6 完了（T7 と並行可）                                                                                                                                                                                                                                                                             |
| **成果物** | [`DashboardOverview.tsx`](../../src/features/links/screens/DashboardOverview.tsx)、[`DashboardWeeklyActivityChart.tsx`](../../src/features/links/components/dashboard/DashboardWeeklyActivityChart.tsx) または [`useDashboardChartUi.tsx`](../../src/features/links/hooks/useDashboardChartUi.tsx) |

- [ ] [`DashboardOverview.tsx`](../../src/features/links/screens/DashboardOverview.tsx): ダッシュクエリの `isPending` / `isFetching` を画面の loading に含める
- [ ] チャートは **実系列**で描画する
- [ ] 7 日すべて 0 のとき、チャート用の **空／ゼロ**のコピーまたは表示を行う（エラー再試行は US-X）
- [ ] スタイルは既存ダッシュボードと揃える

**DoD**: 実機またはシミュレータで、データがある場合／週がすべて 0 の場合の両方を確認できる。

---

### T9 — 回帰テスト・品質ゲート

|            |                                |
| ---------- | ------------------------------ |
| **目的**   | ストーリー全体の品質を締める。 |
| **依存**   | T4–T8 完了                     |
| **成果物** | CI 相当のローカル確認ログ      |

- [ ] `pnpm test`（変更範囲に関連する失敗がないこと）
- [ ] `pnpm run check` が通る
- [ ] 必要なら fixture / スナップショットを更新する

**DoD**: `pnpm run check` 通過。テストが緑。

---

## 7. 影響ファイル一覧（参照）

| 種別             | パス                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **済（T1〜T6）** | [§5](#5-実装済みt1t6サマリ) の表（上記に加え `useDashboardOverviewData` のチャート系列接続・[`useDashboardOverviewData.test.ts`](../../src/features/links/__tests__/hooks/useDashboardOverviewData.test.ts)）                                                                                                                                                                                                                                             |
| **更新（T7〜）** | [`DashboardOverview.tsx`](../../src/features/links/screens/DashboardOverview.tsx)、[`DashboardWeeklyActivityChart.tsx`](../../src/features/links/components/dashboard/DashboardWeeklyActivityChart.tsx) または [`useDashboardChartUi.tsx`](../../src/features/links/hooks/useDashboardChartUi.tsx)、[`dashboardOverview.fixtures.ts`](../../src/features/links/testing/dashboardOverview.fixtures.ts)（必要時）、T7 対象の各 mutation hooks + `__tests__` |

---

## 8. ストーリー完了定義（Story DoD）

[dashboard-overview-user-stories-execution-plan.md § 完了定義](dashboard-overview-user-stories-execution-plan.md#完了定義dod) の **US-A** に準拠: **7 日系列がモックなしで RPC の `daily_totals` と一致**し、**`pnpm run check` が通る**。

実務上は **T1〜T9 の DoD をすべて満たす**ことと同等。

**進捗メモ**: **T1〜T6** は完了（[§5](#5-実装済みt1t6サマリ)）。**US-A 全体の Story DoD** には **T7 以降**（mutation `invalidate`・画面 loading / 空表示・T9 品質ゲートなど）がまだ必要。

---

## 9. US-B への引き継ぎ

- [`useDashboardOverviewData`](../../src/features/links/hooks/useDashboardOverviewData.ts) の **コレクション／ドメイン日別行列**は引き続きモック系列＋`splitDayTotalAcrossBuckets`。
- `collectionStats` の仮 `readCount`（`Math.floor(n * 0.45)`）は **US-B** で置換。

---

## 10. 検証コマンド

```bash
pnpm run check
pnpm test
```
