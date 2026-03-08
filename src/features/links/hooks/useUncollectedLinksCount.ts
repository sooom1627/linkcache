import { useQuery } from "@tanstack/react-query";

import { fetchUserLinks } from "../api/fetchLinks.api";
import { linkQueryKeys } from "../constants/queryKeys";

export interface UseUncollectedLinksCountReturn {
  count: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
}

/**
 * コレクション未所属リンク件数を取得するフック
 *
 * Overview 系画面で件数のみを軽量に表示するため、
 * get_user_links を pageSize=1 で呼び出して totalCount だけを利用する。
 */
export function useUncollectedLinksCount(): UseUncollectedLinksCountReturn {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: linkQueryKeys.uncollectedCount(),
    queryFn: async () => {
      const response = await fetchUserLinks({
        uncollectedOnly: true,
        pageSize: 1,
      });

      return response.totalCount;
    },
  });

  return {
    count: data ?? 0,
    isLoading,
    isError,
    error:
      error instanceof Error ? error : error ? new Error(String(error)) : null,
    refetch,
  };
}
