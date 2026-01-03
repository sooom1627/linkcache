import { useQuery } from "@tanstack/react-query";

import { linkQueryKeys } from "../constants/queryKeys";
import type { OgpMetadata } from "../utils/metadata";
import { fetchOgpMetadata } from "../utils/metadata";
import { normalizeUrl } from "../utils/normalizeUrl";

/**
 * OGPメタデータ取得フックのオプション
 */
export interface UseOgpMetadataOptions {
  /**
   * URLが無効な場合や空の場合にクエリを実行しない
   * @default true
   */
  enabled?: boolean;
}

/**
 * OGPメタデータ取得フック
 *
 * React Queryのキャッシュを活用してOGPメタデータを取得します。
 * 同じURLのメタデータは24時間キャッシュされ、再取得を回避します。
 *
 * @param url - 対象URL（正規化されていないURLでも可）
 * @param options - オプション
 * @returns OGPメタデータとローディング状態
 *
 * @example
 * ```tsx
 * const { data: metadata, isLoading } = useOgpMetadata("https://example.com");
 *
 * if (isLoading) return <Loading />;
 * if (metadata) {
 *   return <Preview title={metadata.title} image={metadata.image_url} />;
 * }
 * ```
 */
export function useOgpMetadata(
  url: string | null | undefined,
  options: UseOgpMetadataOptions = {}
): {
  data: OgpMetadata | null | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
} {
  const { enabled = true } = options;

  // URLを正規化（null/undefinedの場合は空文字列）
  const normalizedUrl = url ? normalizeUrl(url) : "";

  // URLが無効な場合はクエリを無効化
  const isEnabled = enabled && normalizedUrl !== "";

  const { data, isLoading, isError, error } = useQuery({
    queryKey: linkQueryKeys.ogpMetadata(normalizedUrl),
    queryFn: () => fetchOgpMetadata(normalizedUrl),
    enabled: isEnabled,
    staleTime: 24 * 60 * 60 * 1000, // 24時間：OGPは頻繁に変わらない
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7日間：メモリに保持
    retry: 1, // 失敗時は1回だけリトライ
    retryDelay: 1000, // 1秒後にリトライ
  });

  return {
    data: data ?? null,
    isLoading,
    isError,
    error: error as Error | null,
  };
}

