import { useCallback, useState } from "react";

import * as Clipboard from "expo-clipboard";
import { useTranslation } from "react-i18next";

import type {
  LinkPasteStatus,
  LinkPreview,
  UseLinkPasteReturn,
} from "../types/linkPaste.types";
import { fetchOgpMetadata } from "../utils/metadata";
import { normalizeUrl } from "../utils/normalizeUrl";
import { isValidUrl } from "../utils/urlValidation";

/**
 * URLからドメインを抽出する
 */
function extractDomain(url: string): string {
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

      // OGPメタデータを取得
      const metadata = await fetchOgpMetadata(normalizedUrl);

      if (metadata) {
        setStatus("preview");
        setPreview({
          url: normalizedUrl,
          title: metadata.title,
          imageUrl: metadata.image_url,
          siteName: metadata.site_name,
          domain,
          faviconUrl: metadata.favicon_url,
        });
      } else {
        setStatus("noOgp");
        setPreview({
          url: normalizedUrl,
          title: null,
          imageUrl: null,
          siteName: null,
          domain,
          faviconUrl: null,
        });
      }
    } catch {
      setStatus("invalid");
      setErrorMessage(t("links.paste.error_clipboard_read_failed"));
      setPreview(null);
    }
  }, [t]);

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
