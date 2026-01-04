import { useCallback, useEffect, useState } from "react";

import * as Clipboard from "expo-clipboard";

import { normalizeUrl } from "../utils/normalizeUrl";
import { isValidUrl } from "../utils/urlValidation";

interface UseClipboardCheckReturn {
  hasValidUrl: boolean;
  clipboardUrl: string | null;
  checkClipboard: () => Promise<void>;
  isLoading: boolean;
}

/**
 * クリップボードに有効なURLがあるかどうかをチェックするフック
 *
 * クリップボードの内容を読み取り、有効なURLが含まれているかを判定します。
 * 定期的にチェックする機能は含まれていません（必要に応じて追加可能）。
 */
export function useClipboardCheck(): UseClipboardCheckReturn {
  const [hasValidUrl, setHasValidUrl] = useState(false);
  const [clipboardUrl, setClipboardUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * クリップボードの内容をチェック
   */
  const checkClipboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const clipboardContent = await Clipboard.getStringAsync();

      // 空のクリップボード
      if (!clipboardContent || clipboardContent.trim() === "") {
        setHasValidUrl(false);
        setClipboardUrl(null);
        setIsLoading(false);
        return;
      }

      // URLを正規化して検証
      try {
        const normalizedUrl = normalizeUrl(clipboardContent.trim());
        if (isValidUrl(normalizedUrl)) {
          setHasValidUrl(true);
          setClipboardUrl(normalizedUrl);
        } else {
          setHasValidUrl(false);
          setClipboardUrl(null);
        }
      } catch {
        setHasValidUrl(false);
        setClipboardUrl(null);
      }
    } catch {
      setHasValidUrl(false);
      setClipboardUrl(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初回マウント時にチェック
  useEffect(() => {
    checkClipboard();
  }, [checkClipboard]);

  return {
    hasValidUrl,
    clipboardUrl,
    checkClipboard,
    isLoading,
  };
}
