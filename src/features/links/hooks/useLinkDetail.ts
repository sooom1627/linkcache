import { useQuery } from "@tanstack/react-query";

import { dataHelpers } from "@/src/shared/utils/timezone";

import { getLinkById } from "../api/getLink.api";
import { linkQueryKeys } from "../constants/queryKeys";
import type { UserLink } from "../types/linkList.types";

/**
 * 指定されたlink_idのリンク詳細を取得するフック
 *
 * @param linkId - 取得するリンクのID
 * @returns React Query のクエリ結果
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useLinkDetail(linkId);
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error />;
 * if (!data) return null;
 *
 * return <LinkDetail link={data} />;
 * ```
 */
export function useLinkDetail(linkId: string) {
  return useQuery<UserLink, Error>({
    queryKey: linkQueryKeys.detail(linkId),
    queryFn: () => getLinkById(linkId),
    enabled: !!linkId,
    select: (data) => {
      // 単一オブジェクトを配列にラップして変換し、最初の要素を返す
      const transformed = dataHelpers.transformTimestamps<UserLink>(
        [data],
        ["triaged_at", "read_at"],
      );
      return transformed[0];
    },
  });
}
