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

describe("fetchOgpMetadata - Basic OGP fetching", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // AsyncStorageはデフォルトでnullを返す（キャッシュなし）
    jest.mocked(AsyncStorage.getItem).mockResolvedValue(null);
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
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
      favicon_url: "https://example.com/favicon.ico",
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
      "https://zenn.dev/zenn/articles/zenn-cli-guide",
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
});

describe("fetchOgpMetadata - Description length limit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(AsyncStorage.getItem).mockResolvedValue(null);
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("truncates description to 300 characters when it exceeds limit", async () => {
    const longDescription = "a".repeat(500);
    jest.mocked(getLinkPreview).mockResolvedValueOnce({
      url: "https://example.com",
      title: "Example Title",
      description: longDescription,
      images: [],
      favicons: [],
      siteName: "Example Site",
      mediaType: "website",
    } as unknown as Awaited<ReturnType<typeof getLinkPreview>>);

    const result = await fetchOgpMetadata("https://example.com");

    expect(result?.description).toBe("a".repeat(300));
    expect(result?.description?.length).toBe(300);
  });

  it("keeps description unchanged when it is 300 characters or less", async () => {
    const shortDescription = "a".repeat(300);
    jest.mocked(getLinkPreview).mockResolvedValueOnce({
      url: "https://example.com",
      title: "Example Title",
      description: shortDescription,
      images: [],
      favicons: [],
      siteName: "Example Site",
      mediaType: "website",
    } as unknown as Awaited<ReturnType<typeof getLinkPreview>>);

    const result = await fetchOgpMetadata("https://example.com");

    expect(result?.description).toBe(shortDescription);
    expect(result?.description?.length).toBe(300);
  });

  it("handles null description correctly", async () => {
    jest.mocked(getLinkPreview).mockResolvedValueOnce({
      url: "https://example.com",
      title: "Example Title",
      description: null,
      images: [],
      favicons: [],
      siteName: "Example Site",
      mediaType: "website",
    } as unknown as Awaited<ReturnType<typeof getLinkPreview>>);

    const result = await fetchOgpMetadata("https://example.com");

    expect(result?.description).toBeNull();
  });
});
