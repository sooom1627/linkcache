import { useCallback, useState } from "react";

import * as Clipboard from "expo-clipboard";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { linkQueryKeys } from "../constants/queryKeys";
import type {
  LinkPasteStatus,
  LinkPreview,
  UseLinkPasteReturn,
} from "../types/linkPaste.types";
import type { OgpMetadata } from "../utils/metadata";
import { fetchOgpMetadata } from "../utils/metadata";
import { normalizeUrl } from "../utils/normalizeUrl";
import { isValidUrl } from "../utils/urlValidation";

/**
 * URLからドメインを抽出する
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * リンク貼り付けフック
 *
 * クリップボードからURLを読み取り、OGPメタデータを取得します。
 * 状態に応じたUIを表示するための情報を提供します。
 */
export function useLinkPaste(): UseLinkPasteReturn {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<LinkPasteStatus>("empty");
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * クリップボードからURLを貼り付け
   */
  const pasteFromClipboard = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const clipboardContent = await Clipboard.getStringAsync();

      // 空のクリップボード
      if (!clipboardContent || clipboardContent.trim() === "") {
        setStatus("invalid");
        setErrorMessage(t("links.paste.error_clipboard_empty"));
        setPreview(null);
        return;
      }

      // URLを正規化して検証
      let normalizedUrl: string;
      try {
        normalizedUrl = normalizeUrl(clipboardContent.trim());
        if (!isValidUrl(normalizedUrl)) {
          throw new Error("Invalid URL");
        }
      } catch {
        setStatus("invalid");
        setErrorMessage(t("links.paste.error_invalid_url"));
        setPreview(null);
        return;
      }

      const domain = extractDomain(normalizedUrl);

      // React Queryのキャッシュを活用してOGPメタデータを取得
      // キャッシュがあればそれを使用、なければfetchしてキャッシュに保存
      const metadata = await queryClient.fetchQuery<OgpMetadata | null>({
        queryKey: linkQueryKeys.ogpMetadata(normalizedUrl),
        queryFn: () => fetchOgpMetadata(normalizedUrl),
        staleTime: 24 * 60 * 60 * 1000, // 24時間：OGPは頻繁に変わらない
        gcTime: 7 * 24 * 60 * 60 * 1000, // 7日間：メモリに保持
      });

      // OGP画像が取得できたかどうかで状態を判定
      // 画像がある場合は完全なプレビュー、ない場合はnoOgp警告を表示
      const hasOgpImage = metadata?.image_url != null;

      setStatus(hasOgpImage ? "preview" : "noOgp");
      setPreview({
        url: normalizedUrl,
        title: metadata?.title ?? null,
        imageUrl: metadata?.image_url ?? null,
        siteName: metadata?.site_name ?? null,
        domain,
        faviconUrl: metadata?.favicon_url ?? null,
      });
    } catch {
      setStatus("invalid");
      setErrorMessage(t("links.paste.error_clipboard_read_failed"));
      setPreview(null);
    }
  }, [t, queryClient]);

  /**
   * 状態をリセット
   */
  const reset = useCallback(() => {
    setStatus("empty");
    setPreview(null);
    setErrorMessage(null);
  }, []);

  // 保存可能かどうか
  const canSave = status === "preview" || status === "noOgp";

  return {
    status,
    preview,
    errorMessage,
    pasteFromClipboard,
    reset,
    canSave,
  };
}
