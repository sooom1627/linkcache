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

describe("fetchOgpMetadata - AsyncStorage cache", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // AsyncStorageはデフォルトでnullを返す（キャッシュなし）
    jest.mocked(AsyncStorage.getItem).mockResolvedValue(null);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

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

    jest
      .mocked(AsyncStorage.getItem)
      .mockResolvedValueOnce(JSON.stringify(cachedMetadata));

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

    jest
      .mocked(AsyncStorage.getItem)
      .mockResolvedValueOnce(JSON.stringify(expiredCache));

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
