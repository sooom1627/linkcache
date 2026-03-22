/**
 * Compile-time contract: `get_dashboard_overview` RPC return shape (US-B §3).
 * If `Database['public']['Functions']['get_dashboard_overview']['Returns']` drifts
 * from `DashboardOverviewRpcJson`, `tsc` fails on `Assert` below.
 */
import type { DashboardOverviewRpcJson, Database } from "./supabase.types";

type RpcReturn =
  Database["public"]["Functions"]["get_dashboard_overview"]["Returns"];

type Assert<T extends true> = T;

/** Fails when `Returns` is not assignable to `DashboardOverviewRpcJson`. */
type RpcReturnMatchesContract = Assert<
  RpcReturn extends DashboardOverviewRpcJson ? true : false
>;

void 0 as unknown as RpcReturnMatchesContract;
