import { getLinkPreview } from "link-preview-js";

export interface LinkMetadata {
  title: string | null;
  description: string | null;
  image_url: string | null;
  site_name: string | null;
  favicon_url: string | null;
}

/**
 * URLからメタデータを取得する
 *
 * @param url メタデータを取得するURL
 * @returns メタデータオブジェクト
 */
export async function fetchLinkMetadata(url: string): Promise<LinkMetadata> {
  try {
    const data = await getLinkPreview(url, {
      imagesPropertyType: "og", // OGP画像を優先
      followRedirects: "follow",
    });

    // 型ガードとデータ整形
    if ("title" in data) {
      return {
        title: data.title || null,
        description: data.description || null,
        image_url:
          data.images && data.images.length > 0 ? data.images[0] : null,
        site_name: data.siteName || null,
        favicon_url:
          data.favicons && data.favicons.length > 0 ? data.favicons[0] : null,
      };
    }

    // 画像のみなどの場合
    return {
      title: null,
      description: null,
      image_url: "url" in data ? (data.url as string) : null,
      site_name: null,
      favicon_url: null,
    };
  } catch (error) {
    console.error("Failed to fetch link metadata:", error);
    // エラー時はnullを返して処理を継続できるようにする
    return {
      title: null,
      description: null,
      image_url: null,
      site_name: null,
      favicon_url: null,
    };
  }
}
