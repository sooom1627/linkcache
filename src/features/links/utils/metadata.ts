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
}

/**
 * URLからOGPメタデータを取得する
 *
 * link-preview-jsを使用して、URLからOpen Graph Protocol (OGP)メタデータを取得します。
 * 日本語サイトや様々なエンコーディングに対応しています。
 *
 * @param url - 対象URL
 * @returns OGPメタデータ、失敗時またはwebsite以外の場合はnull
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
      timeout: 5000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LinkCache/1.0; +https://linkcache.app)",
      },
    })) as LinkPreviewResponse;

    // website以外のメディアタイプ（video, audio, image等）は対象外
    if (data.mediaType !== "website") {
      return null;
    }

    return {
      title: data.title ?? null,
      description: data.description ?? null,
      image_url: data.images?.[0] ?? null,
      site_name: data.siteName ?? null,
      favicon_url: data.favicons?.[0] ?? null,
    };
  } catch {
    return null;
  }
}
