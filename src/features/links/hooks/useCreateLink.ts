import { useMutation } from "@tanstack/react-query";

import {
  createLinkWithStatus,
  type CreateLinkResponse,
} from "../api/createLink.api";
import { fetchOgpMetadata } from "../utils/metadata";

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
 * メタデータ取得に失敗してもURLのみでリンクは作成されます。
 *
 * @returns リンク作成mutation関数と状態
 *
 * @example
 * ```tsx
 * const { createLink, isPending, isError, isSuccess } = useCreateLink();
 *
 * const handleSubmit = () => {
 *   createLink("https://example.com");
 * };
 * ```
 */
export function useCreateLink(): UseCreateLinkReturn {
  const mutation = useMutation({
    mutationFn: async (url: string) => {
      // OGPメタデータを取得（失敗してもnullが返る）
      const metadata = await fetchOgpMetadata(url);

      // APIを呼び出してリンクを作成
      return createLinkWithStatus({
        url,
        title: metadata?.title ?? null,
        description: metadata?.description ?? null,
        image_url: metadata?.image_url ?? null,
        favicon_url: metadata?.favicon_url ?? null,
        site_name: metadata?.site_name ?? null,
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
