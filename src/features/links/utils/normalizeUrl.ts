/**
 * URLを正規化する
 *
 * - プロトコルがない場合は https:// を補完
 * - プロトコルとホスト名を小文字に変換
 * - 末尾のスラッシュを削除
 * - 前後の空白を削除
 *
 * @param url - 正規化するURL
 * @returns 正規化されたURL
 *
 * @example
 * ```typescript
 * normalizeUrl("example.com") // "https://example.com"
 * normalizeUrl("HTTPS://EXAMPLE.COM/") // "https://example.com"
 * normalizeUrl("https://example.com/Path") // "https://example.com/Path"
 * ```
 */
export function normalizeUrl(url: string): string {
  // 空文字チェック
  const trimmed = url.trim();
  if (trimmed === "") {
    return "";
  }

  // プロトコルの補完と正規化
  let normalized = trimmed;

  // プロトコルがない場合は https:// を補完
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  // URLをパースして正規化
  try {
    const parsed = new URL(normalized);

    // プロトコルとホスト名を小文字に変換
    // パス、クエリ、フラグメントはそのまま保持
    const protocol = parsed.protocol.toLowerCase();
    const host = parsed.host.toLowerCase();

    // URLを再構築
    let result = `${protocol}//${host}`;

    // パスを追加（pathname は常に / で始まる）
    if (parsed.pathname !== "/") {
      result += parsed.pathname;
    }

    // 末尾のスラッシュを削除
    result = result.replace(/\/+$/, "");

    // クエリパラメータを追加
    if (parsed.search) {
      result += parsed.search;
    }

    // フラグメントを追加
    if (parsed.hash) {
      result += parsed.hash;
    }

    return result;
  } catch {
    // パースに失敗した場合は元の値を返す
    return trimmed;
  }
}
