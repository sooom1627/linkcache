import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLinkPreview } from "link-preview-js";

import { fetchOgpMetadata } from "../../utils/metadata";

// AsyncStorageのモック
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
  getAllKeys: jest.fn(),
}));

// link-preview-jsのモック
jest.mock("link-preview-js", () => ({
  getLinkPreview: jest.fn(),
}));

describe("fetchOgpMetadata", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // AsyncStorageはデフォルトでnullを返す（キャッシュなし）
    jest.mocked(AsyncStorage.getItem).mockResolvedValue(null);
  });

  it("fetches and returns OGP metadata via link-preview-js", async () => {
    jest.mocked(getLinkPreview).mockResolvedValueOnce({
      url: "https://example.com",
      title: "Example Title",
      description: "Example Description",
      images: ["https://example.com/image.jpg"],
      favicons: ["https://example.com/favicon.ico"],
      siteName: "Example Site",
      mediaType: "website",
    } as unknown as Awaited<ReturnType<typeof getLinkPreview>>);

    const result = await fetchOgpMetadata("https://example.com");

    expect(getLinkPreview).toHaveBeenCalledWith("https://example.com", {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
      followRedirects: "follow",
    });
    expect(result).toEqual({
      title: "Example Title",
      description: "Example Description",
      image_url: "https://example.com/image.jpg",
      site_name: "Example Site",
      favicon_url: "https://example.com/favicon.ico",
    });
    // AsyncStorageに保存されることを確認
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it("returns first image and favicon when multiple exist", async () => {
    jest.mocked(getLinkPreview).mockResolvedValueOnce({
      url: "https://example.com",
      title: "Title",
      description: "Description",
      images: [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg",
      ],
      favicons: [
        "https://example.com/favicon1.ico",
        "https://example.com/favicon2.ico",
      ],
      siteName: "Site",
      mediaType: "website",
    } as unknown as Awaited<ReturnType<typeof getLinkPreview>>);

    const result = await fetchOgpMetadata("https://example.com");

    expect(result?.image_url).toBe("https://example.com/image1.jpg");
    expect(result?.favicon_url).toBe("https://example.com/favicon1.ico");
  });

  it("returns fallback metadata when fetch fails", async () => {
    jest.mocked(getLinkPreview).mockRejectedValueOnce(new Error("Timeout"));

    const result = await fetchOgpMetadata("https://example.com/page");

    expect(result).toEqual({
      title: "page",
      description: null,
      image_url: null,
      site_name: "example.com",
      favicon_url: null,
    });
  });

  it("returns null for invalid URLs on complete failure", async () => {
    jest.mocked(getLinkPreview).mockRejectedValueOnce(new Error("Error"));

    const result = await fetchOgpMetadata("not-a-valid-url");

    expect(result).toBeNull();
  });

  it("handles zenn.dev URLs correctly", async () => {
    jest.mocked(getLinkPreview).mockResolvedValueOnce({
      url: "https://zenn.dev/zenn/articles/zenn-cli-guide",
      title: "Zenn CLIで記事・本を管理する方法",
      images: ["https://res.cloudinary.com/zenn/image/upload/image.png"],
      siteName: "Zenn",
      favicons: ["https://static.zenn.studio/images/logo-transparent.png"],
      mediaType: "article",
    } as unknown as Awaited<ReturnType<typeof getLinkPreview>>);

    const result = await fetchOgpMetadata(
      "https://zenn.dev/zenn/articles/zenn-cli-guide"
    );

    expect(result?.title).toBe("Zenn CLIで記事・本を管理する方法");
    expect(result?.site_name).toBe("Zenn");
  });

  it("handles note.com URLs correctly", async () => {
    jest.mocked(getLinkPreview).mockResolvedValueOnce({
      url: "https://note.com",
      title: "note ――つくる、つながる、とどける。",
      description: "クリエイターが文章やマンガ、写真、音声を投稿...",
      images: ["https://assets.st-note.com/image.png"],
      siteName: "note（ノート）",
      favicons: ["https://assets.st-note.com/favicon.ico"],
      mediaType: "website",
    } as unknown as Awaited<ReturnType<typeof getLinkPreview>>);

    const result = await fetchOgpMetadata("https://note.com");

    expect(result?.title).toBe("note ――つくる、つながる、とどける。");
    expect(result?.site_name).toBe("note（ノート）");
  });

  describe("Document and Media files", () => {
    it("handles PDF URLs with proper fallback", async () => {
      const result = await fetchOgpMetadata(
        "https://example.com/documents/report-2024.pdf"
      );

      // PDFの場合はlink-preview-jsを呼ばずに直接フォールバック
      expect(getLinkPreview).not.toHaveBeenCalled();
      expect(result?.title).toBe("report-2024");
      expect(result?.description).toBe("PDF Document");
      expect(result?.image_url).toBeNull();
    });

    it("handles Japanese PDF filenames", async () => {
      const result = await fetchOgpMetadata(
        "https://example.co.jp/%E5%A0%B1%E5%91%8A%E6%9B%B8.pdf"
      );

      expect(result?.title).toBe("報告書");
      expect(result?.description).toBe("PDF Document");
    });

    it("handles video URLs with proper fallback", async () => {
      const result = await fetchOgpMetadata(
        "https://example.com/videos/demo.mp4"
      );

      expect(getLinkPreview).not.toHaveBeenCalled();
      expect(result?.title).toBe("demo");
      expect(result?.description).toBe("Video");
    });

    it("handles PDF detected by Content-Type", async () => {
      jest.mocked(getLinkPreview).mockResolvedValueOnce({
        url: "https://example.com/document",
        contentType: "application/pdf",
        mediaType: "application",
      } as unknown as Awaited<ReturnType<typeof getLinkPreview>>);

      const result = await fetchOgpMetadata("https://example.com/document");

      expect(result?.description).toBe("PDF Document");
    });
  });

  describe("AsyncStorage cache", () => {
    it("returns cached metadata when available", async () => {
      const cachedMetadata = {
        data: {
          title: "Cached Title",
          description: "Cached Description",
          image_url: "https://example.com/cached.jpg",
          site_name: "Example",
          favicon_url: "https://example.com/favicon.ico",
        },
        timestamp: Date.now(),
      };

      jest.mocked(AsyncStorage.getItem).mockResolvedValueOnce(
        JSON.stringify(cachedMetadata)
      );

      const result = await fetchOgpMetadata("https://example.com");

      // キャッシュから取得されるため、link-preview-jsは呼ばれない
      expect(getLinkPreview).not.toHaveBeenCalled();
      expect(result).toEqual(cachedMetadata.data);
    });

    it("fetches from link-preview-js when cache is expired", async () => {
      const expiredCache = {
        data: {
          title: "Expired Title",
          description: null,
          image_url: null,
          site_name: "example.com",
          favicon_url: null,
        },
        timestamp: Date.now() - 31 * 24 * 60 * 60 * 1000, // 31日前
      };

      jest.mocked(AsyncStorage.getItem).mockResolvedValueOnce(
        JSON.stringify(expiredCache)
      );

      jest.mocked(getLinkPreview).mockResolvedValueOnce({
        url: "https://example.com",
        title: "Fresh Title",
        description: "Fresh Description",
        images: ["https://example.com/fresh.jpg"],
        siteName: "Example",
        mediaType: "website",
      } as unknown as Awaited<ReturnType<typeof getLinkPreview>>);

      const result = await fetchOgpMetadata("https://example.com");

      // 期限切れキャッシュは削除され、link-preview-jsが呼ばれる
      expect(AsyncStorage.removeItem).toHaveBeenCalled();
      expect(getLinkPreview).toHaveBeenCalled();
      expect(result?.title).toBe("Fresh Title");
    });
  });
});
