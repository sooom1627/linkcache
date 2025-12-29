/**
 * TLDパターン（2文字以上のアルファベット）
 * 例: .com, .jp, .io, .dev
 */
const TLD_PATTERN = /\.[a-z]{2,}$/i;

/**
 * IPアドレスパターン（IPv4）
 * 例: 192.168.1.1, 127.0.0.1
 */
const IPV4_PATTERN = /^(\d{1,3}\.){3}\d{1,3}$/;

/**
 * ホスト名が有効なTLDを持つかどうかを検証する
 */
function hasValidTld(hostname: string): boolean {
  // ポート番号を除去
  const hostWithoutPort = hostname.split(":")[0];

  // IPアドレスの場合は有効
  if (IPV4_PATTERN.test(hostWithoutPort)) {
    return true;
  }

  // localhost + ポートの場合は有効（開発用）
  if (hostWithoutPort === "localhost" && hostname.includes(":")) {
    return true;
  }

  // TLDの存在をチェック
  return TLD_PATTERN.test(hostWithoutPort);
}

/**
 * URLにプロトコルを補完する
 */
function addProtocolIfMissing(url: string): string {
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

/**
 * URLが有効かどうかを検証する
 *
 * 以下の条件を満たす場合に有効と判定:
 * - http または https プロトコル
 * - 有効なTLD（.com, .jp等）を持つ、またはIPアドレス、またはlocalhost:port
 * - 空白を含まない
 *
 * @param url - 検証するURL
 * @returns 有効な場合true
 *
 * @example
 * ```typescript
 * isValidUrl("https://example.com") // true
 * isValidUrl("example.com") // true（プロトコル補完後に検証）
 * isValidUrl("https://hello") // false（TLDなし）
 * isValidUrl("http://192.168.1.1") // true（IPアドレス）
 * ```
 */
export function isValidUrl(url: string): boolean {
  // 空文字チェック
  const trimmed = url.trim();
  if (trimmed === "") {
    return false;
  }

  // 空白を含む場合は無効
  if (/\s/.test(trimmed)) {
    return false;
  }

  // プロトコルを補完
  const withProtocol = addProtocolIfMissing(trimmed);

  try {
    const parsed = new URL(withProtocol);

    // http/https のみ許可
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    // TLDの検証
    if (!hasValidTld(parsed.host)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
