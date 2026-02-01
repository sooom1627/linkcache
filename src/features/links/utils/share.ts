import { Share } from "react-native";

interface ShareLinkParams {
  url: string;
  title?: string | null;
}

/**
 * リンクを共有する
 *
 * @param params - 共有するリンクの情報
 * @param params.url - リンクのURL（必須）
 * @param params.title - リンクのタイトル（オプション）
 */
export async function shareLink({
  url,
  title,
}: ShareLinkParams): Promise<void> {
  try {
    await Share.share({
      message: title ? `${title}\n${url}` : url,
      url,
      title: title || url,
    });
  } catch (error) {
    // Shareダイアログがキャンセルされた場合などはエラーを無視
    if (error instanceof Error && error.message !== "User did not share") {
      console.error("Failed to share link:", error);
    }
  }
}
