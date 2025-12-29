/**
 * 削除対象の計測パラメータ（ブラックリスト）
 *
 * - Google Analytics: utm_*
 * - Facebook: fbclid
 * - Google Ads: gclid, gclsrc
 * - その他: ref, tag, source, mc_eid, _ga
 */
const TRACKING_PARAMS = new Set([
  // Google Analytics (UTM)
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  // Facebook
  "fbclid",
  // Google Ads
  "gclid",
  "gclsrc",
  // その他
  "ref",
  "tag",
  "source",
  "mc_eid",
  "_ga",
  // Twitter/X
  "twclid",
  // Microsoft
  "msclkid",
]);

/**
 * クエリパラメータから計測用パラメータを削除する
 *
 * @param searchParams - URLSearchParams オブジェクト
 * @returns 計測パラメータを除いた新しい URLSearchParams
 */
function removeTrackingParams(searchParams: URLSearchParams): URLSearchParams {
  const cleaned = new URLSearchParams();

  searchParams.forEach((value, key) => {
    // utm_ で始まるパラメータも削除
    if (key.startsWith("utm_")) {
      return;
    }
    // ブラックリストに含まれるパラメータを削除
    if (TRACKING_PARAMS.has(key.toLowerCase())) {
      return;
    }
    cleaned.append(key, value);
  });

  return cleaned;
}

/**
 * URLを正規化する
 *
 * - プロトコルがない場合は https:// を補完
 * - プロトコルとホスト名を小文字に変換
 * - 末尾のスラッシュを削除
 * - 前後の空白を削除
 * - 計測用クエリパラメータを削除（utm_*, fbclid, gclid等）
 *
 * @param url - 正規化するURL
 * @returns 正規化されたURL
 *
 * @example
 * ```typescript
 * normalizeUrl("example.com") // "https://example.com"
 * normalizeUrl("HTTPS://EXAMPLE.COM/") // "https://example.com"
 * normalizeUrl("https://example.com/Path") // "https://example.com/Path"
 * normalizeUrl("https://example.com?utm_source=fb") // "https://example.com"
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

    // クエリパラメータを追加（計測パラメータを除去）
    if (parsed.search) {
      const cleanedParams = removeTrackingParams(parsed.searchParams);
      const cleanedSearch = cleanedParams.toString();
      if (cleanedSearch) {
        result += `?${cleanedSearch}`;
      }
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
