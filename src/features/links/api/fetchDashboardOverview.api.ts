import { z } from "zod";

import { supabase } from "@/src/shared/lib/supabase";

const dashboardDailyTotalRowSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  added_count: z.number().int().nonnegative(),
  read_count: z.number().int().nonnegative(),
});

export const dashboardOverviewRpcSchema = z.object({
  daily_totals: z.array(dashboardDailyTotalRowSchema).length(7),
  daily_by_collection: z.array(z.unknown()),
  daily_by_domain: z.array(z.unknown()),
});

export type DashboardOverviewRpcResult = z.infer<
  typeof dashboardOverviewRpcSchema
>;

type GetDashboardOverviewResponse = {
  data: unknown;
  error: { message: string } | null;
};

/**
 * Growth Dashboard 用に RPC get_dashboard_overview を呼び、7 日分の daily_totals 等を返す。
 *
 * @param pTz - IANA タイムゾーン（例: Asia/Tokyo）。RPC の暦日境界と一致させること。
 * @throws 未認証、Supabase エラー、RPC データなし、Zod 検証失敗時
 */
export async function fetchDashboardOverview(
  pTz: string,
): Promise<DashboardOverviewRpcResult> {
  const authResponse = await supabase.auth.getUser();

  if (authResponse.error || !authResponse.data.user) {
    throw new Error("Not authenticated");
  }

  const response = (await supabase.rpc("get_dashboard_overview", {
    p_tz: pTz,
  })) as GetDashboardOverviewResponse;

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (response.data === null || response.data === undefined) {
    throw new Error("No data returned from RPC");
  }

  const parsed = dashboardOverviewRpcSchema.safeParse(response.data);
  if (!parsed.success) {
    const firstMessage =
      parsed.error.issues[0]?.message ?? "Unknown validation error";
    throw new Error(`Validation failed: ${firstMessage}`);
  }

  if (typeof __DEV__ !== "undefined" && __DEV__) {
    console.log(
      "[fetchDashboardOverview]",
      JSON.stringify(parsed.data, null, 2),
    );
  }

  return parsed.data;
}
