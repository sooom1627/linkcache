import { useCallback } from "react";

import * as WebBrowser from "expo-web-browser";

/**
 * リンクを開くためのフック
 *
 * expo-web-browserを使用してアプリ内ブラウザでリンクを開きます。
 *
 * 設計判断:
 * - expo-web-browserを使用することで、アプリ内でブラウザを開くことができ、
 *   ユーザーがアプリのコンテキストを失うことなくリンクを閲覧できます。
 * - Linking.openURL()はシステムブラウザに切り替えるため、アプリから離脱してしまいます。
 * - プラットフォーム固有の設定により、iOS/Androidの両方で最適なユーザー体験を提供します。
 *
 * iOS/Androidの両方で適切な設定を適用します。
 */
export function useOpenLink() {
  const openLink = useCallback(async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url, {
        // iOS: 下からスワイプして閉じられるモーダルスタイル
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        // iOS: コントロールの色をアプリのテーマに合わせる
        controlsColor: "#94a3b8",
        // Android: ツールバーの色を白に設定
        toolbarColor: "#FFFFFF",
        // Android: スクロール時にツールバーを隠してコンテンツを広く表示
        enableBarCollapsing: true,
      });
    } catch (error) {
      // エラーが発生した場合は静かに失敗（ユーザー体験を損なわない）
      // 必要に応じてエラーログを出力
      console.error("Failed to open browser:", error);
    }
  }, []);

  return { openLink };
}
