import { useQuery } from "@tanstack/react-query";

import { getDeviceTimezone } from "@/src/shared/utils/timezone";

import {
  fetchDashboardOverview,
  type DashboardOverviewRpcResult,
} from "../api/fetchDashboardOverview.api";
import { linkQueryKeys } from "../constants/queryKeys";

/** React Query staleTime for dashboard overview (30 min cache; freshness controlled by mutation invalidation). */
export const dashboardOverviewStaleTimeMs = 30 * 60 * 1000;

export interface UseDashboardOverviewQueryReturn {
  data: DashboardOverviewRpcResult | undefined;
  isLoading: boolean;
  isPending: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
}

/**
 * Caches get_dashboard_overview via React Query for the Growth Dashboard.
 * Calendar-day boundaries align device IANA timezone with RPC p_tz (tz is part of the query key).
 */
export function useDashboardOverviewQuery(): UseDashboardOverviewQueryReturn {
  const tz = getDeviceTimezone();

  const { data, isLoading, isPending, isFetching, isError, error, refetch } =
    useQuery({
      queryKey: linkQueryKeys.dashboardOverview({ tz }),
      queryFn: () => fetchDashboardOverview(tz),
      staleTime: dashboardOverviewStaleTimeMs,
    });

  return {
    data,
    isLoading,
    isPending,
    isFetching,
    isError,
    error:
      error instanceof Error ? error : error ? new Error(String(error)) : null,
    refetch,
  };
}
