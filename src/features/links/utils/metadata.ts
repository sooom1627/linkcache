import { getLinkPreview } from "link-preview-js";

/**
 * OGPメタデータの型定義
 */
export interface OgpMetadata {
  title: string | null;
  description: string | null;
  image_url: string | null;
  site_name: string | null;
  favicon_url: string | null;
}

/**
 * link-preview-jsのレスポンス型（website用）
 */
interface LinkPreviewResponse {
  url: string;
  title?: string;
  description?: string;
  images?: string[];
  favicons?: string[];
  siteName?: string;
  mediaType: string;
  contentType?: string;
}

/**
 * サポートするメディアタイプ
 * website: 通常のWebページ
 * application: PDF等のドキュメント
 */
const SUPPORTED_MEDIA_TYPES = ["website", "application"];

/**
 * URLからファイル名を抽出する（PDF等のフォールバック用）
 *
 * @param url - 対象URL
 * @returns ファイル名（拡張子なし）、取得不可の場合はnull
 */
function extractFilenameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const lastSegment = pathname.split("/").pop();

    if (!lastSegment) return null;

    // 拡張子を除去してファイル名を取得
    const nameWithoutExtension = lastSegment.replace(/\.[^.]+$/, "");

    // デコードして読みやすい形式に
    return decodeURIComponent(nameWithoutExtension) || null;
  } catch {
    return null;
  }
}

/**
 * URLからサイト名を抽出する（フォールバック用）
 *
 * @param url - 対象URL
 * @returns ホスト名（www.なし）
 */
function extractSiteNameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * URLからfavicon URLを生成する（フォールバック用）
 *
 * @param url - 対象URL
 * @returns favicon URL（{protocol}//{hostname}/favicon.ico）、取得不可の場合はnull
 */
function extractFaviconUrlFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
  } catch {
    return null;
  }
}

/**
 * PDFかどうかを判定する
 *
 * @param url - 対象URL
 * @param contentType - Content-Typeヘッダー（存在する場合）
 * @returns PDFかどうか
 */
function isPdfUrl(url: string, contentType?: string): boolean {
  // Content-Typeでの判定
  if (contentType?.includes("application/pdf")) {
    return true;
  }

  // 拡張子での判定
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.toLowerCase().endsWith(".pdf");
  } catch {
    return false;
  }
}

/**
 * URLからOGPメタデータを取得する
 *
 * link-preview-jsを使用して、URLからOpen Graph Protocol (OGP)メタデータを取得します。
 * 日本語サイトや様々なエンコーディングに対応しています。
 * PDFなどのドキュメントもURLからタイトルを推測して対応します。
 *
 * @param url - 対象URL
 * @returns OGPメタデータ、失敗時はnull
 *
 * @example
 * ```typescript
 * const metadata = await fetchOgpMetadata("https://example.com");
 * if (metadata) {
 *   console.log(metadata.title); // "Example Title"
 * }
 * ```
 */
export async function fetchOgpMetadata(
  url: string,
): Promise<OgpMetadata | null> {
  try {
    const data = (await getLinkPreview(url, {
      timeout: 10000, // 10秒に延長（日本語サイト対応）
      headers: {
        // 実際のブラウザに近いUser-Agent
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        // 日本語を優先するAccept-Language
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
        // 標準的なAcceptヘッダー
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
      // リダイレクトを追跡
      followRedirects: "follow",
    })) as LinkPreviewResponse;

    // PDFの場合は特別処理
    if (isPdfUrl(url, data.contentType)) {
      return {
        title: extractFilenameFromUrl(url),
        description: "PDF Document",
        image_url: null,
        site_name: extractSiteNameFromUrl(url),
        favicon_url: data.favicons?.[0] ?? extractFaviconUrlFromUrl(url),
      };
    }

    // サポートするメディアタイプのみ処理
    if (!SUPPORTED_MEDIA_TYPES.includes(data.mediaType)) {
      // video/audio等の場合はURLから基本情報を抽出
      return {
        title: extractFilenameFromUrl(url) || extractSiteNameFromUrl(url),
        description: null,
        image_url: null,
        site_name: extractSiteNameFromUrl(url),
        favicon_url: data.favicons?.[0] ?? extractFaviconUrlFromUrl(url),
      };
    }

    return {
      title: data.title ?? null,
      description: data.description ?? null,
      image_url: data.images?.[0] ?? null,
      site_name: data.siteName ?? null,
      favicon_url: data.favicons?.[0] ?? null,
    };
  } catch {
    // 完全に失敗した場合はURLから最低限の情報を取得
    return createFallbackMetadata(url);
  }
}

/**
 * フォールバックメタデータを作成する
 * ネットワークエラー等でOGP取得が完全に失敗した場合に使用
 *
 * @param url - 対象URL
 * @returns 最低限のメタデータ
 */
function createFallbackMetadata(url: string): OgpMetadata | null {
  const siteName = extractSiteNameFromUrl(url);
  const filename = extractFilenameFromUrl(url);
  const faviconUrl = extractFaviconUrlFromUrl(url);

  // URLが無効な場合はnullを返す
  if (!siteName) {
    return null;
  }

  return {
    title: filename || siteName,
    description: null,
    image_url: null,
    site_name: siteName,
    favicon_url: faviconUrl,
  };
}
