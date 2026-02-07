import { getLinkPreview } from "link-preview-js";

import { maxDescriptionLength } from "../constants/descriptionLimit";

import { getCachedOgpMetadata, setCachedOgpMetadata } from "./ogpCache";

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
 * link-preview-jsのレスポンス型
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
 */
const SUPPORTED_MEDIA_TYPES = ["website", "article", "application"];

/**
 * descriptionを300文字に切り詰める
 *
 * @param description - 切り詰めるdescription
 * @returns 切り詰められたdescription（300文字以下）、nullの場合はnull
 */
export function truncateDescription(description: string | null): string | null {
  if (!description) return null;
  if (description.length <= maxDescriptionLength) return description;
  return description.slice(0, maxDescriptionLength);
}

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
 * URLがドキュメントやメディアファイルかどうかを判定する
 *
 * @param url - 対象URL
 * @returns ドキュメント/メディアファイルかどうか
 */
function isDocumentOrMediaUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    const docExtensions = [
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".ppt",
      ".pptx",
    ];
    const mediaExtensions = [
      ".mp4",
      ".mp3",
      ".wav",
      ".avi",
      ".mov",
      ".webm",
      ".m4a",
      ".flac",
    ];
    const extensions = [...docExtensions, ...mediaExtensions];
    return extensions.some((ext) => pathname.endsWith(ext));
  } catch {
    return false;
  }
}

/**
 * ファイルタイプの説明を取得
 *
 * @param url - 対象URL
 * @returns ファイルタイプの説明
 */
function getFileTypeDescription(url: string): string {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    if (pathname.endsWith(".pdf")) return "PDF Document";
    if (pathname.endsWith(".doc") || pathname.endsWith(".docx"))
      return "Word Document";
    if (pathname.endsWith(".xls") || pathname.endsWith(".xlsx"))
      return "Excel Spreadsheet";
    if (pathname.endsWith(".ppt") || pathname.endsWith(".pptx"))
      return "PowerPoint Presentation";
    if (pathname.match(/\.(mp4|avi|mov|webm)$/)) return "Video";
    if (pathname.match(/\.(mp3|wav|m4a|flac)$/)) return "Audio";
    return "Document";
  } catch {
    return "Document";
  }
}

/**
 * link-preview-jsを使用してOGPメタデータを取得する
 *
 * @param url - 対象URL
 * @returns OGPメタデータ、失敗時はnull
 */
async function fetchOgpViaClient(url: string): Promise<OgpMetadata | null> {
  try {
    // PDFやメディアファイルの場合は特別処理
    if (isDocumentOrMediaUrl(url)) {
      const filename = extractFilenameFromUrl(url);
      const siteName = extractSiteNameFromUrl(url);
      const description = getFileTypeDescription(url);

      return {
        title: filename || siteName || "Untitled",
        description: truncateDescription(description),
        image_url: null,
        site_name: siteName,
        favicon_url: siteName ? `https://${siteName}/favicon.ico` : null,
      };
    }

    const data = (await getLinkPreview(url, {
      timeout: 10000, // 10秒タイムアウト
      headers: {
        // iPhone Safari User-Agent（日本語サイト対応）
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
      followRedirects: "follow",
    })) as LinkPreviewResponse;

    // PDFの場合は特別処理
    if (isPdfUrl(url, data.contentType)) {
      return {
        title: extractFilenameFromUrl(url) || extractSiteNameFromUrl(url),
        description: truncateDescription("PDF Document"),
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
        description: truncateDescription(getFileTypeDescription(url)),
        image_url: null,
        site_name: extractSiteNameFromUrl(url),
        favicon_url: data.favicons?.[0] ?? extractFaviconUrlFromUrl(url),
      };
    }

    return {
      title: data.title ?? null,
      description: truncateDescription(data.description ?? null),
      image_url: data.images?.[0] ?? null,
      site_name: data.siteName ?? null,
      favicon_url: data.favicons?.[0] ?? null,
    };
  } catch (error) {
    console.error("Failed to fetch OGP via link-preview-js:", error);
    return null;
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

/**
 * URLからOGPメタデータを取得する
 *
 * 2層キャッシュ戦略:
 * 1. AsyncStorage（永続化、30日間）→ オフライン対応、アプリ再起動後も保持
 * 2. link-preview-js（クライアントサイド）→ フロントエンドで完結
 * 3. URLフォールバック → 最低限の情報生成
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
  // Step 1: AsyncStorageキャッシュをチェック
  const cachedMetadata = await getCachedOgpMetadata(url);
  if (cachedMetadata && cachedMetadata.title) {
    return cachedMetadata;
  }

  // Step 2: link-preview-js経由で取得
  const metadata = await fetchOgpViaClient(url);

  // 有効なメタデータが取得できた場合
  if (metadata && metadata.title) {
    // AsyncStorageに保存（非同期で実行、エラーは無視）
    setCachedOgpMetadata(url, metadata).catch(() => {
      // エラーは無視（キャッシュはオプショナル）
    });
    return metadata;
  }

  // Step 3: 失敗した場合、URLから最低限の情報を生成
  const fallbackMetadata = createFallbackMetadata(url);

  // フォールバックメタデータもキャッシュに保存（次回のネットワークエラーを回避）
  if (fallbackMetadata) {
    setCachedOgpMetadata(url, fallbackMetadata).catch(() => {
      // エラーは無視
    });
  }

  return fallbackMetadata;
}
