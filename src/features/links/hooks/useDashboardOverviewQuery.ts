import { useQuery } from "@tanstack/react-query";

import { getDeviceTimezone } from "@/src/shared/utils/timezone";

import {
  fetchDashboardOverview,
  type DashboardOverviewRpcResult,
} from "../api/fetchDashboardOverview.api";
import { linkQueryKeys } from "../constants/queryKeys";

/** ダッシュ overview の React Query staleTime（30 分キャッシュ。鮮度は mutation の invalidate に依存） */
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
 * Growth Dashboard 用に get_dashboard_overview の結果を React Query でキャッシュする。
 * 暦日境界は端末 IANA TZ と RPC の p_tz を一致させる（queryKey に tz を含める）。
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
