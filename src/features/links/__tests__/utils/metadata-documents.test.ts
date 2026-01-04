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

describe("fetchOgpMetadata - Document and Media files", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // AsyncStorageはデフォルトでnullを返す（キャッシュなし）
    jest.mocked(AsyncStorage.getItem).mockResolvedValue(null);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("handles PDF URLs with proper fallback", async () => {
    const result = await fetchOgpMetadata(
      "https://example.com/documents/report-2024.pdf",
    );

    // PDFの場合はlink-preview-jsを呼ばずに直接フォールバック
    expect(getLinkPreview).not.toHaveBeenCalled();
    expect(result?.title).toBe("report-2024");
    expect(result?.description).toBe("PDF Document");
    expect(result?.image_url).toBeNull();
  });

  it("handles Japanese PDF filenames", async () => {
    const result = await fetchOgpMetadata(
      "https://example.co.jp/%E5%A0%B1%E5%91%8A%E6%9B%B8.pdf",
    );

    expect(result?.title).toBe("報告書");
    expect(result?.description).toBe("PDF Document");
  });

  it("handles video URLs with proper fallback", async () => {
    const result = await fetchOgpMetadata(
      "https://example.com/videos/demo.mp4",
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
