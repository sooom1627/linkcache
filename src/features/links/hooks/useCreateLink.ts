import { useMutation, useQueryClient } from "@tanstack/react-query";

import { checkDuplicateLink } from "../api/checkDuplicateLink.api";
import {
  createLinkWithStatus,
  type CreateLinkResponse,
} from "../api/createLink.api";
import { linkQueryKeys } from "../constants/queryKeys";
import type { OgpMetadata } from "../utils/metadata";
import { fetchOgpMetadata } from "../utils/metadata";
import { normalizeUrl } from "../utils/normalizeUrl";

/**
 * 重複リンクエラー
 *
 * 既に同じURLが保存されている場合にスローされます。
 * UI側でエラータイプを判別するために使用します。
 */
export class DuplicateLinkError extends Error {
  constructor() {
    super("DUPLICATE_LINK");
    this.name = "DuplicateLinkError";
  }
}

/**
 * リンク作成フックの戻り値
 */
export interface UseCreateLinkReturn {
  createLink: (url: string) => void;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
  data: CreateLinkResponse | undefined;
  reset: () => void;
}

/**
 * リンク作成フック
 *
 * URLからOGPメタデータを取得し、リンクを作成します。
 * 重複チェックを行い、既に保存済みのURLの場合はDuplicateLinkErrorをスローします。
 * メタデータ取得に失敗してもURLのみでリンクは作成されます。
 *
 * @returns リンク作成mutation関数と状態
 *
 * @example
 * ```tsx
 * const { createLink, isPending, isError, isSuccess, error } = useCreateLink();
 *
 * const handleSubmit = () => {
 *   createLink("https://example.com");
 * };
 *
 * // 重複チェック
 * if (error instanceof DuplicateLinkError) {
 *   // 重複エラーの表示
 * }
 * ```
 */
export function useCreateLink(): UseCreateLinkReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (url: string) => {
      // URLを正規化
      const normalizedUrl = normalizeUrl(url);

      // 重複チェック: 同じURLが既に保存されていないか確認
      const isDuplicate = await checkDuplicateLink(normalizedUrl);
      if (isDuplicate) {
        throw new DuplicateLinkError();
      }

      // React Queryのキャッシュを活用してOGPメタデータを取得
      // キャッシュがあればそれを使用、なければfetchしてキャッシュに保存
      const metadata = await queryClient.fetchQuery<OgpMetadata | null>({
        queryKey: linkQueryKeys.ogpMetadata(normalizedUrl),
        queryFn: () => fetchOgpMetadata(normalizedUrl),
        staleTime: 24 * 60 * 60 * 1000, // 24時間：OGPは頻繁に変わらない
        gcTime: 7 * 24 * 60 * 60 * 1000, // 7日間：メモリに保持
      });

      // APIを呼び出してリンクを作成
      // descriptionの切り詰めはmetadata層の責務（fetchOgpMetadata内で既に適用済み）
      return createLinkWithStatus({
        url: normalizedUrl,
        title: metadata?.title ?? null,
        description: metadata?.description ?? null,
        image_url: metadata?.image_url ?? null,
        favicon_url: metadata?.favicon_url ?? null,
        site_name: metadata?.site_name ?? null,
      });
    },
    onSuccess: () => {
      // リンク作成成功時にリンク一覧のキャッシュを無効化
      // これにより、次回の取得時に最新データが取得される
      queryClient.invalidateQueries({
        queryKey: linkQueryKeys.lists(),
      });
    },
  });

  return {
    createLink: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}
