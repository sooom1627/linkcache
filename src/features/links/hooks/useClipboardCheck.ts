import { useCallback, useEffect, useState } from "react";

import * as Clipboard from "expo-clipboard";

import { normalizeUrl } from "../utils/normalizeUrl";
import { isValidUrl } from "../utils/urlValidation";

interface UseClipboardCheckReturn {
  hasValidUrl: boolean;
  clipboardUrl: string | null;
  checkClipboard: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
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
  const [error, setError] = useState<Error | null>(null);

  /**
   * クリップボードの内容をチェック
   */
  const checkClipboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const clipboardContent = await Clipboard.getStringAsync();

      // 空のクリップボード
      if (!clipboardContent || clipboardContent.trim() === "") {
        setHasValidUrl(false);
        setClipboardUrl(null);
        return;
      }

      // URLを正規化して検証
      try {
        const normalizedUrl = normalizeUrl(clipboardContent.trim());
        if (isValidUrl(normalizedUrl)) {
          setHasValidUrl(true);
          setClipboardUrl(normalizedUrl);
          setError(null); // 有効なURLが見つかった時、エラーをクリア
        } else {
          setHasValidUrl(false);
          setClipboardUrl(null);
          setError(new Error("Invalid URL format"));
        }
      } catch (err) {
        setHasValidUrl(false);
        setClipboardUrl(null);
        setError(
          err instanceof Error ? err : new Error("URL validation failed"),
        );
      }
    } catch (err) {
      setHasValidUrl(false);
      setClipboardUrl(null);
      setError(
        err instanceof Error ? err : new Error("Failed to access clipboard"),
      );
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
    error,
  };
}
