# ダッシュボード概要：API 層実装と UI 修正の実施事項

## 背景

MVP では「Growth Dashboard」と「Activity Log（直近 7 日）」を通じて、トリアージしたリンクを**実績として可視化**し、受動的な保存から能動的な整理へ寄せることが目的である（プロダクト方針：confidence-driven、決断疲れの低減）。

一方、現状の `DashboardOverview` は画面・フック・チャート／内訳 UI の骨格はあるが、**週次系列や日別内訳の一部がモックやクライアント側の仮計算に依存**している。また `useLinks` の件数上限などにより、**集計の母集団がユーザー全体のリンクを表さない**可能性がある。これでは「自分の進み具合」を信頼して見られず、ダッシュボードの価値が損なわれる。

そこで本プランでは、**Supabase 側で定義した集計仕様（日付の意味・重複計上の扱い・ドメイン対象など）に沿った RPC／ビュー**へ寄せ、**`api/` + React Query** で実データを取得し、モック依存を撤去する。また、失敗時の表示や引っ張り更新など、本番利用に耐える **UI 上の欠け**を埋める。

このドキュメントは、もともと実装前の**現状整理・仕様の固定・実施チェックリスト**として共有していた。以降、マージ済み実装に応じて**実装状況表（§3.2 等）と §1 の追記**を更新する。

---

## ユーザーストーリー（何を実装したいか）

MVP の「Growth Dashboard／Activity Log」と、トリアージ後の振り返り体験を、**自分の実データ**で支えることがゴールである。

| 誰として                                           | 何がしたいか                                                                                          | なぜか（価値）                                                                                                                           |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **リンクを保存・トリアージしているユーザー**として | 直近 7 日の「追加したリンク数」と「読了（完了）したリンク数」を、**グラフで正しく**見たい             | モックではなく実績を見て、「今週どれだけ処理したか」を把握し、**決断疲れを減らす自信**（プロダクト哲学の confidence-driven）につなげたい |
| 同上                                               | ある日の棒を選んだとき、その日の内訳を**コレクション別**・**ドメイン別**で見たい                      | 「どのテーマ／どのサイトから情報が増えているか」を把握し、次の行動（読む順・整理）を決めやすくしたい                                     |
| 同上                                               | コレクション一覧の「追加／読了」の内訳が、**実際の `link_status` 等に基づく**数字であることを期待する | 一覧の件数とダッシュボードの話が食い違わず、**信頼できるダッシュボード**として使いたい                                                   |
| 同上                                               | 通信やサーバが失敗したとき、**何が起きたか分かり、再試行**できる                                      | 真っ白や無言の失敗ではなく、復帰の導線がほしい（レジリエンス）                                                                           |
| 同上                                               | 画面を**引っ張って更新**し、さきほどトリアージした結果がグラフに反映されることを確認したい            | 操作直後のフィードバックで「アプリが生きている」感覚を得たい                                                                             |

上記を満たすために、本ドキュメント以下のセクションでは **Supabase 集計（1 回の RPC 等）**、**`api/` + React Query**、**モック／仮計算の撤去**、**エラー UI と RefreshControl** を実施事項として列挙する。

---

## 0. 参照スキル・ルール（実装・レビュー時）

| 参照先                                                                                             | 用途                                                              |
| -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [native-data-fetching](../../.cursor/skills/native-data-fetching/SKILL.md)                         | React Query、`expo/fetch` 方針                                    |
| [building-native-ui](../../.cursor/skills/building-native-ui/SKILL.md)                             | ScrollView／safe area／アニメーション（本リポは NativeWind 併用） |
| [vercel-react-native-skills](../../.cursor/skills/vercel-react-native-skills/SKILL.md)             | リスト・レンダリング・UI パターン                                 |
| [supabase-postgres-best-practices](../../.cursor/skills/supabase-postgres-best-practices/SKILL.md) | クエリ性能・RLS・接続・スキーマ（**セクション 3 で展開**）        |
| [cursor-rules.mdc](../../.cursor/rules/cursor-rules.mdc)                                           | Zod、feature/`api/` 集約、TDD                                     |

Supabase 周りは、SKILL 本文に加え `.cursor/skills/supabase-postgres-best-practices/references/` 以下の個別ルールを実装前に開くこと。

---

## 1. 現状調査サマリ（コードベース）

- **画面** — [`src/features/links/screens/DashboardOverview.tsx`](../../src/features/links/screens/DashboardOverview.tsx): `useDashboardOverviewData` と `useDashboardOverviewUi` でチャート／内訳を表示。`collectionsLoading || domainsLoading` のときのみスケルトン。**エラー UI なし**。
- **データ** — [`src/features/links/hooks/useDashboardOverviewData.ts`](../../src/features/links/hooks/useDashboardOverviewData.ts): **実データ**は `useCollections`（RPC `get_user_collections`）と `useLinks({ limit: 500 })`。**モック**は [`mockAddedByDay` / `mockReadByDay`](../../src/features/links/utils/dashboardStats.ts)。**合成**はコレクション／ドメインの `readCount` を `Math.floor(n * 0.45)` とする仮計算、日別内訳はモック日計を `splitDayTotalAcrossBuckets` で均等配分。
- **UI ロジック** — [`useDashboardOverviewUi.tsx`](../../src/features/links/hooks/useDashboardOverviewUi.tsx) および [`useDashboardChartUi`](../../src/features/links/hooks/useDashboardChartUi.tsx) / [`useDashboardBreakdownUi.ts`](../../src/features/links/hooks/useDashboardBreakdownUi.ts): 入力は `DashboardOverviewData` 形状に依存。データ差し替えで大部分は流用可。

**Git 履歴の注意**: コミット `7a3d917` のメッセージは _「remove unused useDashboardBreakdownUi hook」_ だが、実際の変更は **`useDashboardBreakdownUi` を `.tsx` から `.ts` にリネームし実装を簡略化したもの**であり、フックは削除されていない。ドキュメントやレビューで当該コミットを根拠に「フックが消えた」と解釈しないこと。

- **ルート** — [`app/(protected)/(tabs)/(dashboard)/dashboard.tsx`](<../../app/(protected)/(tabs)/(dashboard)/dashboard.tsx>): `ScreenContainer` + `DashboardOverview`。

**解釈**: 「API のみ」ではなく、**週次系列・日別バケット・読了比率が未接続（モック／仮計算）**であり、`useLinks` の 500 件上限によるドメイン集計は**母集団を代表しない**可能性がある。

- **API（ダッシュ RPC・US-A T4 済）** — [`fetchDashboardOverview.api.ts`](../../src/features/links/api/fetchDashboardOverview.api.ts): `get_dashboard_overview` を `p_tz` 付きで呼び、Zod（`dashboardOverviewRpcSchema`）で `daily_totals`（7 件）ほかを検証。**`useDashboardOverviewData` や画面からは未接続**（T5 の React Query 以降で配線予定）。開発ビルドでは成功時に `__DEV__` のみ `console.log` でパース後 JSON を出力可能。

### 1.1 現行スキーマ・マイグレーション（実装・RPC 設計前の突合せ）

§3 の RPC／インデックス議論は、**次のリポジトリ上の事実**と突合せてから確定すること。初期テーブルが Dashboard 等で作成され、マイグレーションが追記型になっている点も踏まえる。

| 参照先                                                                                           | 内容                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`supabase/migrations/`](../../supabase/migrations/)                                             | インクリメンタルな DDL／`CREATE OR REPLACE FUNCTION`。現行の **`get_user_links`**・**`get_user_collections`**・**`user_links_view`**・**`delete_user_link`** 等の定義源。                                                                                                                                                                                |
| [`src/features/links/types/supabase.types.ts`](../../src/features/links/types/supabase.types.ts) | 生成型。**`link_status`** の列（`created_at`, `read_at`, `status` / `triage_status` 列挙子、`triaged_at` 等）、**`user_links_view`**、RPC 引数・戻り値の形。                                                                                                                                                                                             |
| 代表マイグレーション                                                                             | `20260223000000_get_user_collections.sql`（`get_user_collections`）、`20260307000000_fix_get_user_links_order_by.sql` / `20260307000001_user_links_view_security_invoker.sql`（`user_links_view` と `read_at` 露出）、`20260308000000_add_uncollected_to_get_user_links.sql`（`get_user_links` 拡張）、`20260228000000_delete_user_link.sql`（削除 RPC） |

**`triage_status`（型上の列挙子）**: `new` \| `read_soon` \| `stock` \| `done`（`supabase.types.ts` の `Enums["triage_status"]`）。§2 の「`new` / `done` のみ」はこの列挙と整合させる。

**`read_at` の存在**: アプリコード・生成型・上記マイグレーション上は **`link_status.read_at`（`user_links_view` 経由でも参照）が存在する**。それでも「確定」と書く前に、**対象環境でマイグレーションが全適用済みか**を確認する（未適用 DB では列が無い可能性がある）。新規マイグレーションで列を追加する場合は、**型の再生成**（`supabase.types.ts`）を実施手順に含める。

---

## 2. プロダクト定義（方針 ― DB 突合せ後に RPC で確定）

MVP の「Activity Log（直近 7 日）」および内訳表示について、次を**プロダクト上の集計キー**とする。§1.1 の現行列・列挙子と矛盾する場合は、マイグレーションまたは仕様のどちらを直すかを判断してから実装する。

- **「追加（added）」の日付**: **`link_status.created_at`**（Inbox 追加＝ユーザーがそのリンクを自分のキューに載せた日時）。チャートの「追加」系列、および「追加」件数として扱う集計はすべてこれに基づく。
- **「完了／読了（read）」の日付**: **`read_at` の日付**（`read_at IS NOT NULL` の行について日単位にバケット化）。保存は DB では `timestamptz` を想定。列の有無・型は §1.1 を満たすこと。
- **タイムゾーン（集計キーの「日」をどう定義するか） — 採用: 案 1（確定）**

  **方針**: ストレージは従来どおり **UTC の `timestamptz`**。日別集計の「1 日」は **ユーザー端末の IANA タイムゾーンにおける暦日**とする。チャートの「直近 7 日」窓（[`src/shared/utils/weekRangeDisplay.ts`](../../src/shared/utils/weekRangeDisplay.ts)）もローカル暦日前提のため、**RPC の日バケットと表示窓を一致させる**。

  **RPC**: `p_tz text`（IANA、例: `Asia/Tokyo`）を引数に取り、`link_status.created_at` / `read_at` を `(col AT TIME ZONE 'UTC') AT TIME ZONE p_tz` 等で **その TZ の 0 時基準の暦日**に `date_trunc('day', ...)` してカウントする。返す `daily_totals` 等の日付キー（`date`）は **その暦日**を意味する。

  **クライアント**: IANA は [`getDeviceTimezone()`](../../src/shared/utils/timezone.ts)（内部は `Intl.DateTimeFormat().resolvedOptions().timeZone`）から取得し、RPC 呼び出しに渡す。タイムゾーンが変わったときはキャッシュが古くならないよう、React Query の `queryKey` に `p_tz`（または同値）を含める。

  **非採用（参考）**
  - **案 2（UTC 日境界のみ）**: 棒が UTC 基準となりローカル窓とずれるため本 MVP では採用しない。
  - **案 3（生タイムスタンプを大量返却しクライアントのみでバケット）**: 転送量・計算負荷の観点から採用しない。

  **戻り値の型**: 日次キーは **`date`**（暦日）を推奨。`timestamptz` で返す場合も、意味は **案 1 の暦日**に限定してドキュメント化すること。

- **コレクション内訳と重複計上**: **内訳テーブル**（コレクション別の行・および日×コレクションの内訳）に限り、同一リンクが複数コレクションに属する場合は**コレクションごとに 1 回ずつ計上する（重複計上する）**。チャート上部の**日次合計**（全体の `added` / `read` 本数）は**リンクを一意に数え**、コレクション所属の重複で二重に増やさない。
- **ドメイン内訳の母集団**: **全ステータスではない**。**`triage_status` が `new`（ユーザー向けの「added」＝Inbox）または `done` のリンクのみ**を対象とする。`read_soon`・`stock` はドメイン内訳の集計から除外する。

---

## 3. バックエンド（Supabase）実施事項

[supabase-postgres-best-practices SKILL](../../.cursor/skills/supabase-postgres-best-practices/SKILL.md)の**優先度カテゴリ**に沿って設計・レビューする。ダッシュボードは読み取り集計が中心のため、特に **Query Performance**、**Security & RLS**、**Connection Management**、**Schema Design** を最初に満たす。**新規 RPC の列・結合・列挙子は §1.1 の現行マイグレーション／生成型と矛盾しないこと**（必要ならマイグレーションを先に追加）。

### 3.1 カテゴリ別チェックリスト（SKILL 準拠）

1. **Query Performance（CRITICAL）** — 集計 SQL は `EXPLAIN (ANALYZE, BUFFERS)` で確認する。フルテーブルスキャンや不要なソートが出ないようにする。実装時の参照: [monitor-explain-analyze.md](../../.cursor/skills/supabase-postgres-best-practices/references/monitor-explain-analyze.md)、[query-missing-indexes.md](../../.cursor/skills/supabase-postgres-best-practices/references/query-missing-indexes.md)、[query-composite-indexes.md](../../.cursor/skills/supabase-postgres-best-practices/references/query-composite-indexes.md)、[query-partial-indexes.md](../../.cursor/skills/supabase-postgres-best-practices/references/query-partial-indexes.md)（ステータスや `read_at IS NOT NULL` など条件が固定なら部分インデックスを検討）。
2. **Connection Management（CRITICAL）** — ダッシュ表示のために**複数 RPC を連打しない**。可能なら**1 回の RPC（または 1 クエリ）**でチャート用日次合計＋内訳に必要な行をまとめて返し、モバイルからの往復を減らす。参照: [conn-pooling.md](../../.cursor/skills/supabase-postgres-best-practices/references/conn-pooling.md)、[data-n-plus-one.md](../../.cursor/skills/supabase-postgres-best-practices/references/data-n-plus-one.md)（アプリ側の N+1 も同様に避ける）。
3. **Security & RLS（CRITICAL）** — 新規テーブル／ビュー／RPC いずれも**RLS または同等の境界**を維持。RLS 式が重いと集計が遅くなるため、ポリシーとインデックスの両方を見る。参照: [security-rls-basics.md](../../.cursor/skills/supabase-postgres-best-practices/references/security-rls-basics.md)、[security-rls-performance.md](../../.cursor/skills/supabase-postgres-best-practices/references/security-rls-performance.md)、[security-privileges.md](../../.cursor/skills/supabase-postgres-best-practices/references/security-privileges.md)。`SECURITY DEFINER` を使う場合は **search_path 固定・最小権限・対象列の限定**を徹底する（SKILL の Supabase 注記に合わせる）。
4. **Schema Design（HIGH）** — 外部キー側インデックス、適切な型（日付は `timestamptz`）、不要な JSON 肥大化を避ける。参照: [schema-foreign-key-indexes.md](../../.cursor/skills/supabase-postgres-best-practices/references/schema-foreign-key-indexes.md)、[schema-data-types.md](../../.cursor/skills/supabase-postgres-best-practices/references/schema-data-types.md)。
5. **Concurrency & Locking（MEDIUM-HIGH）** — 集計は主に読み取りだが、マイグレーションやメンテ時は短いトランザクションに留める。参照: [lock-short-transactions.md](../../.cursor/skills/supabase-postgres-best-practices/references/lock-short-transactions.md)。
6. **Data Access Patterns（MEDIUM）** — 内訳行が多い場合は**カーソル／キーセット型ページング**を検討（ダッシュ MVP では 7 日×限定的バケットなら不要なことも多い）。参照: [data-pagination.md](../../.cursor/skills/supabase-postgres-best-practices/references/data-pagination.md)。
7. **Monitoring & Diagnostics（LOW–MEDIUM）** — 本番前後で `pg_stat_statements` やプランの再確認。参照: [monitor-pg-stat-statements.md](../../.cursor/skills/supabase-postgres-best-practices/references/monitor-pg-stat-statements.md)。

### 3.2 機能要件

- **ユーザー境界**: 既存方針どおり `profiles` 経由の設計・RLS と整合させる。
- **集計の置き場**: 日別 × コレクション／ドメインの行列は、クライアントで 500 件 `get_user_links` から再現せず **Postgres 集計（VIEW または RPC）** に寄せる。
- **推奨アウトプット形（例）**
  - `daily_totals`: 直近 7 日の `{ date, added_count, read_count }[]`（チャート用）
  - `daily_by_collection`: 同期間・コレクション別（フラット行またはクライアントがピボットしやすい形）
  - `daily_by_domain`: ドメイン抽出を SQL 関数化し、アプリの [`extractDomain`](../../src/features/links/utils/urlUtils.ts) と**同じ入力に対して同じ文字列**になること。**対象行は §2 のとおり `new` と `done` のみ**
- **`extractDomain` と SQL の同値性（検証手順）**: 現行実装は `new URL(url).hostname` を `www.` 除去し、失敗時は `""`。SQL 側は例として `regexp_replace(split_part(...), '^www\.', '')` 等を組む。**検証は次で固定する**:
  1. **共有テストベクトル**: 表形式で URL 入力と期待ドメイン（文字列）をリポジトリに置く（例: `src/features/links/utils/__tests__/extractDomain.vectors.ts` のような 1 ファイル、または本ドキュメント付録の表）。Jest で `extractDomain(url)` を検証。
  2. **SQL 側**: 同じベクトルを `SELECT extract_domain_for_dashboard(url) AS d` で実行するテストを用意する（ローカル Postgres・Supabase SQL Editor・CI の SQL ステップなど、チームで 1 方式に統一）。TS と SQL の期待値は**同一配列を参照**するか、JSON フィードを共有。
  3. **エッジケースの明示**: 少なくとも次を含める — `https://www.example.com/path?x=1` → `example.com`；不正文字列 → `""`；`http://localhost:8080` → `localhost`；ポート付き `https://a.example.com:443/` → `a.example.com`（`URL` の hostname 仕様に合わせる）。パスやクエリは hostname に影響しないことの確認。
- **インデックス（初期候補）**: 仕様で決めた「追加日」「読了日」に対応する `(user_id, date_trunc(...))` や `(user_id, created_at)`、`read_at` 条件付きなど。**実際の `EXPLAIN` 結果で不足分を追加**する（机上の列挙だけにしない）。

#### 実装状況（US-A・追記）

| 項目                                    | 状態                                                                                                                                                                                                                                   |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RPC `get_dashboard_overview(p_tz text)` | **実装済み**（`daily_totals` は §2 どおり；`daily_by_collection` / `daily_by_domain` は当面 `[]`）                                                                                                                                     |
| リポジトリ DDL                          | [`supabase/migrations/20260322000000_get_dashboard_overview.sql`](../../supabase/migrations/20260322000000_get_dashboard_overview.sql)                                                                                                 |
| クライアント型                          | [`supabase.types.ts` の `Functions.get_dashboard_overview`](../../src/features/links/types/supabase.types.ts)                                                                                                                          |
| API 層（Zod）                           | **実装済み** — [`fetchDashboardOverview.api.ts`](../../src/features/links/api/fetchDashboardOverview.api.ts)、テスト [`fetchDashboardOverview.api.test.ts`](../../src/features/links/__tests__/api/fetchDashboardOverview.api.test.ts) |
| 検証記録                                | [dashboard-overview-us-a.md](./dashboard-overview-us-a.md) §5（T1〜T3）· §5.1（T4）                                                                                                                                                    |

`EXPLAIN (ANALYZE, BUFFERS)` は §3.1 のとおり、データ量に応じたフォローアップとする。

### 3.3 性能（ダッシュボード・モバイルで追加で押さえる点）

§3.1 の Postgres 観点に加え、次を意識する（詳細は SKILL／references に委ね、ここではスコープだけ固定する）。

| 観点                     | 内容                                                                                                                                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **レスポンスサイズ**     | `daily_by_domain` はドメイン数が増えると JSON が肥大化しうる。**MVP では上位 N 件＋「その他」**など上限を RPC 側で決め、クライアントで無制限にピボットしない（必要になったら §3.1 のページングを検討）。                                         |
| **集計 SQL の熱い部分**  | `WHERE`／結合条件に**行ごとに非 IMMUTABLE な式だけ**を置くとインデックスが効きにくい。ドメイン抽出を `JOIN` 条件にそのまま重ねる場合は `EXPLAIN` で確認。**生成列やマテビュー**はデータ量・運用コストを見てから（YAGNI）。                       |
| **RLS とインデックス**   | 既に §3.1 にあるが、ダッシュは**読み取り集計が一度に重い**ため、`security-rls-performance` に沿い **ポリシーがシーケンシャルスキャンを誘発していないか**を優先的に見る。                                                                         |
| **往復・再取得**         | **1 RPC**（§3.1）に加え、React Query では **`staleTime` を数分**などにし、タブ復帰での無駄な refetch を抑える。§5 の **invalidate が多箇所から飛ぶ**ため、開発中は Network タブで「操作 1 回あたりのダッシュ再取得回数」が過剰でないか確認する。 |
| **クライアントの計算量** | RPC 戻り値から `DashboardOverviewData` への変換は **メモ化**（`useMemo` 等）し、選択日変更以外でチャート／内訳が毎レンダーで大きな配列を再生成しないようにする。                                                                                 |
| **リスト・チャート**     | 内訳行が増えたら §7 の仮想化を検討。チャートはデータ点は 7 日固定だが、**アニメーション／ジェスチャ**と重なる場合は実機でフレーム落ちを確認する（[vercel-react-native-skills](../../.cursor/skills/vercel-react-native-skills/SKILL.md)）。      |

---

## 4. API レイヤー（`src/features/links/api/`）実施事項

[`.cursor/rules/cursor-rules.mdc`](../../.cursor/rules/cursor-rules.mdc)、[native-data-fetching SKILL](../../.cursor/skills/native-data-fetching/SKILL.md)、[react-native-expo-architecture.mdc](../../.cursor/rules/react-native-expo-architecture.mdc)に従う。

**US-A（ダッシュ概要 RPC）**: [`fetchDashboardOverview.api.ts`](../../src/features/links/api/fetchDashboardOverview.api.ts) を追加済み（`dashboardOverviewRpcSchema`・`fetchDashboardOverview(pTz)`）。検証記録は [dashboard-overview-us-a.md §5.1](./dashboard-overview-us-a.md#51-実装検証記録t4)。

- **責務**: `supabase.rpc(...)` または `.from(...).select(...)` のみ。認証ガード（未ログインは throw）は既存 [`fetchCollections.api.ts`](../../src/features/links/api/fetchCollections.api.ts) と同パターン（`links/api` 全体のスタイル統一は別 issue で追跡可）。
- **Zod**: RPC／ビュー戻り値を**スキーマで parse**し、失敗時は明示的エラー（プロジェクト既存の `safeParse` + メッセージ流れに合わせる）。
- **エラー**: `response.error` / HTTP 相当の失敗は throw し、React Query の `isError` に載せる（SKILL の `if (!response.ok) throw` パターンと同趣旨）。

**今後（US-B/C 等）**: 週次／サマリを分割する場合のみ 2 ファイル化（YAGNI）。

---

## 5. React Query（キー・フック）実施事項

[`src/features/links/constants/queryKeys.ts`](../../src/features/links/constants/queryKeys.ts)を拡張。

- **`linkQueryKeys`（または `dashboardQueryKeys`）**に `overview` 用キーを追加（例: `['links','dashboard','overview', { range: '7d' }]`）。パラメータ化するなら日付範囲をキーに含める。
- **専用フック**（例: `useDashboardOverviewQuery`）: `useQuery` で上記 API を呼ぶ。`staleTime`／`retry` は SKILL の推奨を踏襲（ダッシュボードは数分 `staleTime` でも可）。
- **無効化（invalidate）**: ダッシュボード用 `queryKey` を追加したら、**既に `invalidateQueries` を呼んでいる次のフック**すべてを洗い出し、同じパターンでダッシュキーも無効化する（API ファイル 14 本そのものではなく、**mutation を持つフック**が実際の無効化箇所）。

| フック（mutation）                                                                             | 概要                                        | ダッシュボード影響の例      |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------- | --------------------------- |
| [`useCreateLink`](../../src/features/links/hooks/useCreateLink.ts)                             | リンク新規                                  | 追加系列・ドメイン          |
| [`useDeleteLink`](../../src/features/links/hooks/useDeleteLink.ts)                             | リンク削除                                  | 全系列                      |
| [`useUpdateLinkReadStatus`](../../src/features/links/hooks/useUpdateLinkReadStatus.ts)         | `read_at` / 既読                            | 読了系列・コレクション read |
| [`useSwipeCards`](../../src/features/links/hooks/useSwipeCards.ts)                             | トリアージ後の `invalidate`（再起動時など） | ステータス・一覧と連動      |
| [`useAddLinkToCollection`](../../src/features/links/hooks/useAddLinkToCollection.ts)           | コレクション紐付け                          | コレクション内訳            |
| [`useRemoveLinkFromCollection`](../../src/features/links/hooks/useRemoveLinkFromCollection.ts) | 紐付け解除                                  | 同上                        |
| [`useCreateCollection`](../../src/features/links/hooks/useCreateCollection.ts)                 | コレクション作成                            | 一覧／内訳メタ              |
| [`useUpdateCollection`](../../src/features/links/hooks/useUpdateCollection.ts)                 | コレクション更新                            | 同上                        |
| [`useDeleteCollection`](../../src/features/links/hooks/useDeleteCollection.ts)                 | コレクション削除                            | 同上                        |

**未掲載の API**（例: `updateLinkStatus.api.ts`）は **`useSwipeCards` 経由**でステータス更新とキャッシュ無効化が行われる。新規 mutation フックを追加したら本表を更新する。

---

## 6. `useDashboardOverviewData` の置き換え

- **削除対象**: `mockAddedByDay` / `mockReadByDay` 依存、`splitDayTotalAcrossBuckets` による仮日別行列（サーバから実行列が来るなら）。
- **コレクションサマリ**: `itemsCount` + 仮 `readCount` をやめ、**RPC が返す added/read** に置換。コレクション一覧自体は引き続き `useCollections` でよいが、**同じ画面で二重フェッチになる**場合は RPC 一本化を検討（トレードオフをドキュメント化）。
- **ドメイン**: RPC のドメイン集計に寄せ、**§2 の母集団（`new` / `done` のみ）**を SQL で再現する。クライアント [`buildDomainStatsFromLinks`](../../src/features/links/utils/dashboardStats.ts) は削除またはフォールバック廃止を検討。
- **ローディング合成**: 現状は `collectionsLoading || domainsLoading` のみ。ダッシュ専用クエリを足すなら **`dashboardLoading` を OR** するか、`useQueries` でまとめて `isPending` を集約。

---

## 7. UI 修正（画面・コンテナ）

参照: [building-native-ui SKILL](../../.cursor/skills/building-native-ui/SKILL.md)（ScrollView / safe area / アニメーション）、[vercel-react-native-skills SKILL](../../.cursor/skills/vercel-react-native-skills/SKILL.md)（フォールバック・リスト・画像）、プロジェクトルール（NativeWind `className`）。

**注意**: building-native-ui 本文に「Tailwind 非対応」とあるが、本リポジトリは **NativeWind v3**（[cursor-rules.mdc](../../.cursor/rules/cursor-rules.mdc)）が正。スタイルは**既存の `className` パターンを維持**する。

実施候補:

1. **エラー状態**: `useDashboardOverviewData`（または新フック）から `isError` / `error` を返し、[`DashboardOverview.tsx`](../../src/features/links/screens/DashboardOverview.tsx)で**再試行ボタン付きの簡潔なエラー UI**（SKILL の `if (error) return <Error />` パターン）。部分失敗（コレクション OK・ダッシュ NG）ならセクション単位のエラー表示も検討。
2. **引っ張り更新**: [`ScreenContainer`](../../src/shared/components/layout/ScreenContainer.tsx)は `ScrollView` だが `RefreshControl` 未接続。**ダッシュ画面だけ** `refreshing` / `onRefresh` を渡せるよう `ScreenContainer` にオプションを足すか、ダッシュルートで `ScrollView` を上書きするかを選択（変更範囲最小なら props 拡張）。
3. **空データ**: 7 日とも 0 件のときのチャート／テーブルの**空表示コピー**（既存コンポーネントに props があれば活用）。
4. **アクセシビリティ**: チャート側に既存の `chart.accessibility` があるため、エラー／空状態にも**ラベル**を付与（意味のある状態を読み上げ可能にする）。
5. **パフォーマンス**: 日別行列が大きくなった場合、内訳テーブルは [vercel-react-native-skills](../../.cursor/skills/vercel-react-native-skills/SKILL.md)の**仮想化（FlashList 等）**を検討（現状行数が少なければ後回しで可／YAGNI）。

---

## 8. テスト（`cursor-rules` TDD）

- **API 層**: 既存パターンに倣い [`src/features/links/__tests__/api/`](../../src/features/links/__tests__/api/)に Zod 成功／失敗・認証エラーのテスト。**`fetchDashboardOverview.api.ts` 対は [`fetchDashboardOverview.api.test.ts`](../../src/features/links/__tests__/api/fetchDashboardOverview.api.test.ts)（US-A T4 済）**。今後追加する `*.api.ts` も同様に `*.api.test.ts` で対にする。
- **フック／UI**: `useDashboardChartUi` / `useDashboardBreakdownUi` は、**入力が `DashboardOverviewData`（および関連型）に依存**する単位でテストする。データ取得はモックし、**分岐は「空・通常・エラー」程度**に留める（実装詳細のスナップショット過多は避ける）。
- **Fixtures**: [`dashboardOverview.fixtures.ts`](../../src/features/links/testing/dashboardOverview.fixtures.ts) の `createMinimalOverviewData()` は **`DashboardOverviewData` のデフォルト形**を埋める。RPC 導入後は次の方針で更新する:
  - **RPC が `useDashboardOverviewData` の合成結果に置き換わる**場合: `DashboardOverviewData` 型を先に更新し、fixture のデフォルト列（`addedByDay` 長さ 7 等）を**型エラーに従って**直す。モックは「RPC 生データ」ではなく**フックが画面に渡す形状**に合わせる（YAGNI なら RPC 生 Zod 用 fixture は別ファイルにしない）。
  - **フィールド追加・リネーム**時: 既存テストの `overrides` で足りるか確認し、共通デフォルトは `createMinimalOverviewData` に集約する。
- **ドメイン関数**: §3.2 のベクトルと共有する `extractDomain` の単体テストを [`urlUtils`](../../src/features/links/utils/urlUtils.ts) 近傍に置く。
- **結合**: MSW／Supabase mock は最小限（ルールの「外部プロセスのみモック」に合わせる）。

---

## 9. データフロー（実装後イメージ）

```mermaid
flowchart LR
  subgraph client [ExpoClient]
    DO[DashboardOverview]
    UDD[useDashboardOverviewData]
    UQ[useQuery dashboard]
    API[fetchDashboardOverview.api]
  end
  subgraph supa [Supabase]
    RPC[get_dashboard_overview RPC]
    DB[(link_status links collection_links)]
  end
  DO --> UDD
  UDD --> UQ
  UQ --> API
  API --> RPC
  RPC --> DB
```

---

## 10. このドキュメントについて

- 冒頭の「背景」に本プランの目的と現状課題をまとめた。以降はプラン「ダッシュボード概要：API 層実装と UI 修正の実施事項」に基づき、リポジトリ用にリンクを整備した版である。
- 実装タスクに着手する際は、セクション **1.1（現行スキーマ突合せ）** → セクション 2（プロダクト方針・**TZ は §2 で案 1 確定**）→ セクション 3 の DB/RPC → 4〜8 の順が安全。
