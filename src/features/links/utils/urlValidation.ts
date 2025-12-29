/**
 * TLDパターン（2文字以上のアルファベット）
 * 例: .com, .jp, .io, .dev
 */
const TLD_PATTERN = /\.[a-z]{2,}$/i;

/**
 * IPアドレスパターン（IPv4）
 * 各オクテットが0-255の範囲内であることを検証
 * 例: 192.168.1.1, 127.0.0.1
 */
const IPV4_OCTET = "(25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)";
const IPV4_PATTERN = new RegExp(
  `^${IPV4_OCTET}\\.${IPV4_OCTET}\\.${IPV4_OCTET}\\.${IPV4_OCTET}$`,
);

/**
 * プライベート/特殊IPアドレスかどうかを判定する
 *
 * 以下の範囲をブロック対象として判定:
 * - 0.0.0.0/8 (特殊アドレス)
 * - 10.0.0.0/8 (10.0.0.0 - 10.255.255.255) プライベート
 * - 127.0.0.0/8 (127.0.0.0 - 127.255.255.255) ループバック
 * - 169.254.0.0/16 (169.254.0.0 - 169.254.255.255) リンクローカル
 * - 172.16.0.0/12 (172.16.0.0 - 172.31.255.255) プライベート
 * - 192.168.0.0/16 (192.168.0.0 - 192.168.255.255) プライベート
 * - 224.0.0.0/4 (224.0.0.0 - 239.255.255.255) マルチキャスト
 * - 240.0.0.0/4 (240.0.0.0 - 255.255.255.255) 予約済み/将来用
 * - 255.255.255.255 ブロードキャスト
 *
 * @param ip - 検証するIPアドレス文字列
 * @returns プライベート/特殊IPの場合true
 */
function isPrivateOrSpecialIpAddress(ip: string): boolean {
  // IPアドレス形式でない場合はfalse
  if (!IPV4_PATTERN.test(ip)) {
    return false;
  }

  const octets = ip.split(".").map(Number);
  const [first, second, third, fourth] = octets;

  // 255.255.255.255 - ブロードキャスト
  if (first === 255 && second === 255 && third === 255 && fourth === 255) {
    return true;
  }

  // 0.0.0.0/8 - 特殊アドレス
  if (first === 0) {
    return true;
  }

  // 127.0.0.0/8 - ループバック
  if (first === 127) {
    return true;
  }

  // 10.0.0.0/8 - プライベート
  if (first === 10) {
    return true;
  }

  // 169.254.0.0/16 - リンクローカル
  if (first === 169 && second === 254) {
    return true;
  }

  // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255) - プライベート
  if (first === 172 && second >= 16 && second <= 31) {
    return true;
  }

  // 192.168.0.0/16 - プライベート
  if (first === 192 && second === 168) {
    return true;
  }

  // 224.0.0.0/4 (224.0.0.0 - 239.255.255.255) - マルチキャスト
  if (first >= 224 && first <= 239) {
    return true;
  }

  // 240.0.0.0/4 (240.0.0.0 - 255.255.255.255) - 予約済み/将来用
  if (first >= 240) {
    return true;
  }

  return false;
}

/**
 * ホスト名が有効なTLDを持つかどうかを検証する
 */
function hasValidTld(hostname: string): boolean {
  // ポート番号を除去
  const hostWithoutPort = hostname.split(":")[0];

  // IPアドレスの場合
  if (IPV4_PATTERN.test(hostWithoutPort)) {
    // プライベート/特殊IPアドレスはセキュリティ上の理由でブロック
    // ローカルネットワーク上のサービスへの意図しないアクセスを防止
    if (isPrivateOrSpecialIpAddress(hostWithoutPort)) {
      return false;
    }
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
 * isValidUrl("http://8.8.8.8") // true（パブリックIPアドレス）
 * isValidUrl("http://192.168.1.1") // false（プライベートIPアドレス）
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
