# US-A: Growth Dashboard 7 日系列（`daily_totals`）

**ストーリー**: ユーザーとして、Growth Dashboard の週次チャートに **RPC `get_dashboard_overview` の `daily_totals`**（7 日の added / read）を表示したい。内訳系列（コレクション／ドメイン）は本ストーリーではモックのまま。

一次情報: [dashboard-overview-api.md](./dashboard-overview-api.md) · ストーリー対応: [dashboard-overview-user-stories-execution-plan.md](./dashboard-overview-user-stories-execution-plan.md)

| 項目                                 | 内容                                                 |
| ------------------------------------ | ---------------------------------------------------- |
| **推奨実行順**                       | 下記 **T1 → T9**（依存があるため順序を崩さない）     |
| **1 タスクあたりの完了定義**         | 各タスク末尾の **DoD** を満たすこと                  |
| **スプリント完了（ストーリー DoD）** | [§ ストーリー完了定義](#ストーリー完了定義story-dod) |
| **T1〜T3 実装**                      | **完了**（[§5 実装検証記録（T1〜T3）](#5-実装検証記録t1t3)） |

---

## 1. スコープ / 非スコープ

| IN                                                                                   | OUT                                                                     |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `daily_totals` の **7 日系列**をチャートに表示                                       | `daily_by_collection` / `daily_by_domain` の実データ（**US-B / US-C**） |
| `api/` + Zod + React Query + `useDashboardOverviewData` の **added/read 系列**の置換 | エラー UI・再試行・**RefreshControl**（**US-X**）                       |
| 7 日すべて 0 の **空／ゼロ表示**                                                     | 内訳テーブル実データ・`extractDomain` SQL 同値（**US-C**）              |

---

## 2. 事前読了（実装前）

1. [§1.1 現行スキーマ](dashboard-overview-api.md#11-現行スキーママイグレーション実装rpc-設計前の突合せ)
2. [§2 プロダクト定義](dashboard-overview-api.md#2-プロダクト定義方針--db-突合せ後に-rpc-で確定)
3. [§10 層の安全順](dashboard-overview-api.md#10-このドキュメントについて)

参照 Skills: [native-data-fetching](../../.cursor/skills/native-data-fetching/SKILL.md)、[supabase-postgres-best-practices](../../.cursor/skills/supabase-postgres-best-practices/SKILL.md)、[vercel-react-native-skills](../../.cursor/skills/vercel-react-native-skills/SKILL.md)、[building-native-ui](../../.cursor/skills/building-native-ui/SKILL.md)。

---

## 3. RPC 契約（確定・参照）

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

## 4. DB マイグレーション手順（Supabase MCP・参照）

DDL の**適用**は Cursor の **Supabase MCP（`user-supabase`）** のみとする（CLI `supabase db push` 等に頼らない）。

| 手順 | 内容                                                                                   |
| ---- | -------------------------------------------------------------------------------------- |
| 1    | ツールスキーマを確認してから `apply_migration`（必須: `project_id`, `name`, `query`）  |
| 2    | `name` は **snake_case**。`query` に RPC 全文（必要なら `link_status` 用インデックス） |
| 3    | 適用後 `list_migrations` で確認                                                        |

`project_id`: ダッシュボード Project Settings → General、または MCP `list_projects`。  
リポジトリに `supabase/migrations/<timestamp>_....sql` を置く場合は **MCP で流した SQL と同一**をコミットする。

---

## 5. 実装検証記録（T1〜T3）

**実施日**: 2026-03-22（検証再実行はリポジトリ／リモートの現状に基づく）

以下を実施し、**T1〜T3 の実装に問題がないこと**を確認した。

| 検証項目 | 結果 |
| -------- | ---- |
| リポジトリのマイグレーション SQL が §3 RPC 契約（7 日窓・`daily_by_*` は `[]`・`SECURITY DEFINER`・`search_path` 固定・`p_tz` 検証・集計キー §2）と一致 | OK — [`supabase/migrations/20260322000000_get_dashboard_overview.sql`](../../supabase/migrations/20260322000000_get_dashboard_overview.sql) |
| リモート DB に関数 `get_dashboard_overview(p_tz text)` が存在 | OK — `pg_proc` 確認 |
| リモートに `idx_link_status_user_id_created_at` / `idx_link_status_user_id_read_at_not_null` が存在 | OK — `pg_indexes` 確認 |
| マイグレーション履歴 | OK — Supabase 上の記録名 `get_dashboard_overview`（version `20260322030621`；リポジトリのファイル timestamp と数字は異なるが **SQL 内容は MCP 適用時と同一**） |
| クライアント型 | OK — [`supabase.types.ts`](../../src/features/links/types/supabase.types.ts) の `Functions.get_dashboard_overview`（`p_tz: string` → `Json`） |
| 静的品質 | OK — `pnpm run check` 通過 |

**ログ（参考）**: マイグレーション直後に MCP `get_logs`（`postgres` / `api`）で **ERROR / FATAL がないこと**を確認済み。

**フォローアップ（未完了・US-A 全体）**: [dashboard-overview-api.md §3.1](./dashboard-overview-api.md#31-カテゴリ別チェックリストskill-準拠) の **`EXPLAIN (ANALYZE, BUFFERS)`** は、データ量増加時に実施する（本記録時点では未実行）。

---

## 6. 実行計画（タスク / サブタスク）

### T1 — スキーマ確認・SQL ドラフト

|            |                                                                                        |
| ---------- | -------------------------------------------------------------------------------------- |
| **目的**   | §3 の RPC を満たす SQL を用意する前に、テーブル列と既存 RPC パターンを確実に合わせる。 |
| **成果物** | レビュー可能なマイグレーション SQL 草案（ファイルまたは PR コメント可）                |

- [x] [§1.1](dashboard-overview-api.md#11-現行スキーママイグレーション実装rpc-設計前の突合せ) と突合せ、または MCP `list_tables` 等で `link_status` に `created_at` / `read_at` / `user_id` があることを確認する
- [x] 既存の `SECURITY DEFINER` RPC（例: `get_user_links`）の `search_path`・権限パターンを参照し、同じ方針で `get_dashboard_overview` を書く
- [x] `daily_totals` が **7 要素**・日付順が **6 日前→今日** になること、`daily_by_*` は `[]` を返すことを SQL レベルで満たす草案を用意する
- [x] 必要なら `link_status` 向けインデックスを草案に含める（負荷・正本 §2 に基づく）

**DoD**: 担当者が MCP `apply_migration` に渡せる **単一の SQL 文字列**として確定している（未適用でもよい）。

---

### T2 — DB マイグレーション適用（MCP）

|            |                                                                           |
| ---------- | ------------------------------------------------------------------------- |
| **目的**   | リモート DB に RPC を作成し、マイグレーション履歴と一致させる。           |
| **依存**   | T1 完了                                                                   |
| **成果物** | 適用済みマイグレーション、任意でリポジトリの `supabase/migrations/...sql` |

- [x] [§4](#4-db-マイグレーション手順supabase-mcp参照) に従い `apply_migration` を実行する（`name` 例: `get_dashboard_overview`）
- [x] `list_migrations` で当該マイグレーションが載っていることを確認する
- [x] （任意）T1 の SQL と同一内容を `supabase/migrations/<timestamp>_get_dashboard_overview.sql` としてコミットする

**DoD**: リモートで `get_dashboard_overview` が定義済み。`list_migrations` で追跡可能。

---

### T3 — クライアント型（Supabase）

|            |                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| **目的**   | `supabase.rpc('get_dashboard_overview', …)` が型安全になる。                                           |
| **依存**   | T2 完了                                                                                                |
| **成果物** | [`supabase.types.ts`](../../src/features/links/types/supabase.types.ts) 更新（または生成物の取り込み） |

- [x] `get_dashboard_overview` の Args / Returns を `Database['public']['Functions']`（またはプロジェクト慣例の場所）に追加する
- [x] MCP `generate_typescript_types` で生成しマージしても、手編集でもよい（手編集で反映済み）

**DoD**: `pnpm run check` で型エラーが出ない（T3 単体で他タスク未着手なら、少なくとも型定義に矛盾がないこと）。

---

### T4 — API 層 + 単体テスト

|            |                                                                                                                                                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **目的**   | RPC 応答を Zod で検証し、アプリから安全に利用する。                                                                                                                                                              |
| **依存**   | T3 完了                                                                                                                                                                                                          |
| **成果物** | [`fetchDashboardOverview.api.ts`](../../src/features/links/api/fetchDashboardOverview.api.ts)、[`fetchDashboardOverview.api.test.ts`](../../src/features/links/__tests__/api/fetchDashboardOverview.api.test.ts) |

- [ ] `supabase.rpc('get_dashboard_overview', { p_tz })` を呼ぶ
- [ ] Zod で `daily_totals`（7 件・`date` / `added_count` / `read_count`）を parse する
- [ ] 失敗時は既存の API エラーパターンに合わせる
- [ ] 正常系・異常系（型不整合など）をテストでカバーする

**DoD**: 新規 API テストが緑。`fetchDashboardOverview` が `daily_totals` を返す。

---

### T5 — Query key + `useDashboardOverviewQuery`

|            |                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **目的**   | ダッシュボード用サーバー状態を React Query でキャッシュする。                                                                  |
| **依存**   | T4 完了                                                                                                                        |
| **成果物** | [`queryKeys.ts`](../../src/features/links/constants/queryKeys.ts)、`useDashboardOverviewQuery`（別ファイルまたは既存フック内） |

- [ ] `linkQueryKeys.dashboardOverview({ tz })` を定義する（`tz` を key に含める）
- [ ] `useQuery` で T4 の fetcher を利用する
- [ ] `staleTime` を数分程度に設定する（正本・プロダクトに合わせる）

**DoD**: フック単体でデータ取得・ローディング・エラーが取得できる（画面未接続でもよい）。

---

### T6 — `useDashboardOverviewData` の系列接続

|            |                                                                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **目的**   | チャート用の `addedByDay` / `readByDay` を **RPC の系列**に差し替える。                                                                                                                                 |
| **依存**   | T5 完了                                                                                                                                                                                                 |
| **成果物** | [`useDashboardOverviewData.ts`](../../src/features/links/hooks/useDashboardOverviewData.ts)、必要なら [`dashboardOverview.fixtures.ts`](../../src/features/links/testing/dashboardOverview.fixtures.ts) |

- [ ] `addedByDay` / `readByDay` のみ T5 のデータを使用する
- [ ] コレクション／ドメインの行列は **従来どおり** `mockAddedByDay` / `mockReadByDay` + `splitDayTotalAcrossBuckets` のままにする
- [ ] fixture / モック日付が §3 の窓と矛盾しないよう更新する

**DoD**: データ層だけ見て、週 7 日の合計が RPC の `daily_totals` と一致する（手動またはログで確認可）。

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

| 種別 | パス                                                                                                        |
| ---- | ----------------------------------------------------------------------------------------------------------- |
| 済（T1〜T2） | [`supabase/migrations/20260322000000_get_dashboard_overview.sql`](../../supabase/migrations/20260322000000_get_dashboard_overview.sql)（§4 と MCP 適用 SQL 同一） |
| 新規 | `src/features/links/api/fetchDashboardOverview.api.ts`                                                      |
| 新規 | `src/features/links/hooks/useDashboardOverviewQuery.ts`（仮称・統合可）                                     |
| 新規 | `src/features/links/__tests__/api/fetchDashboardOverview.api.test.ts`                                       |
| 済（T3） | `src/features/links/types/supabase.types.ts`（`get_dashboard_overview`）                                                                |
| 更新 | `src/features/links/constants/queryKeys.ts`                                                                 |
| 更新 | `src/features/links/hooks/useDashboardOverviewData.ts`                                                      |
| 更新 | `src/features/links/screens/DashboardOverview.tsx`                                                          |
| 更新 | `src/features/links/components/dashboard/DashboardWeeklyActivityChart.tsx` または `useDashboardChartUi.tsx` |
| 更新 | `src/features/links/testing/dashboardOverview.fixtures.ts`（型・データ変更時）                              |
| 更新 | T7 一覧の各 hooks + `__tests__`                                                                             |

---

## 8. ストーリー完了定義（Story DoD）

[dashboard-overview-user-stories-execution-plan.md § 完了定義](dashboard-overview-user-stories-execution-plan.md#完了定義dod) の **US-A** に準拠: **7 日系列がモックなしで RPC の `daily_totals` と一致**し、**`pnpm run check` が通る**。

実務上は **T1〜T9 の DoD をすべて満たす**ことと同等。

**進捗メモ**: **T1〜T3**（DB・型）は完了（§5）。**US-A 全体の Story DoD** には T4 以降（API / React Query / 画面接続など）がまだ必要。

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
