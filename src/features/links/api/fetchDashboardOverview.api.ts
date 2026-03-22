import { z } from "zod";

import { supabase } from "@/src/shared/lib/supabase";

const isoCalendarDayString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

const dashboardDailyTotalRowSchema = z.object({
  date: isoCalendarDayString,
  added_count: z.number().int().nonnegative(),
  read_count: z.number().int().nonnegative(),
});

const dashboardDailyByCollectionRowSchema = z
  .object({
    date: isoCalendarDayString,
    collection_id: z.string().uuid(),
    added_count: z.number().int().nonnegative(),
    read_count: z.number().int().nonnegative(),
  })
  .strict();

export const dashboardOverviewRpcSchema = z.object({
  daily_totals: z.array(dashboardDailyTotalRowSchema).length(7),
  daily_by_collection: z.array(dashboardDailyByCollectionRowSchema),
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
 * Invokes the `get_dashboard_overview` RPC and returns the parsed result,
 * including seven days of `daily_totals` (and related fields) for the Growth Dashboard.
 *
 * @param pTz - IANA timezone identifier (e.g. `Asia/Tokyo`). Must match the RPC
 *   calendar-day boundaries applied to `p_tz`.
 * @throws {Error} If the user is not authenticated, Supabase reports an error,
 *   the RPC returns no payload, or Zod validation of the response fails.
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
