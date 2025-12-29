import { getLinkPreview } from "link-preview-js";

import { fetchOgpMetadata } from "../../utils/metadata";

// link-preview-jsのモック
jest.mock("link-preview-js", () => ({
  getLinkPreview: jest.fn(),
}));

describe("fetchOgpMetadata", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches and returns OGP metadata from URL", async () => {
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

  it("handles missing optional fields", async () => {
    jest.mocked(getLinkPreview).mockResolvedValueOnce({
      url: "https://example.com",
      title: "Title Only",
      mediaType: "website",
    } as unknown as Awaited<ReturnType<typeof getLinkPreview>>);

    const result = await fetchOgpMetadata("https://example.com");

    expect(result).toEqual({
      title: "Title Only",
      description: null,
      image_url: null,
      site_name: null,
      favicon_url: null,
    });
  });

  it("handles PDF URLs with application mediaType", async () => {
    jest.mocked(getLinkPreview).mockResolvedValueOnce({
      url: "https://example.com/document.pdf",
      mediaType: "application",
      contentType: "application/pdf",
      favicons: ["https://example.com/favicon.ico"],
    } as unknown as Awaited<ReturnType<typeof getLinkPreview>>);

    const result = await fetchOgpMetadata("https://example.com/document.pdf");

    expect(result).toEqual({
      title: "document",
      description: "PDF Document",
      image_url: null,
      site_name: "example.com",
      favicon_url: "https://example.com/favicon.ico",
    });
  });

  it("handles PDF URLs detected by extension", async () => {
    jest.mocked(getLinkPreview).mockResolvedValueOnce({
      url: "https://example.com/report.pdf",
      mediaType: "application",
    } as unknown as Awaited<ReturnType<typeof getLinkPreview>>);

    const result = await fetchOgpMetadata("https://example.com/report.pdf");

    expect(result).toEqual({
      title: "report",
      description: "PDF Document",
      image_url: null,
      site_name: "example.com",
      favicon_url: null,
    });
  });

  it("handles video/audio media types with fallback info", async () => {
    jest.mocked(getLinkPreview).mockResolvedValueOnce({
      url: "https://example.com/video.mp4",
      mediaType: "video",
    } as unknown as Awaited<ReturnType<typeof getLinkPreview>>);

    const result = await fetchOgpMetadata("https://example.com/video.mp4");

    expect(result).toEqual({
      title: "video",
      description: null,
      image_url: null,
      site_name: "example.com",
      favicon_url: null,
    });
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

  it("handles Japanese filenames in PDF URLs", async () => {
    jest.mocked(getLinkPreview).mockResolvedValueOnce({
      url: "https://example.co.jp/%E3%83%AC%E3%83%9D%E3%83%BC%E3%83%88.pdf",
      mediaType: "application",
      contentType: "application/pdf",
    } as unknown as Awaited<ReturnType<typeof getLinkPreview>>);

    const result = await fetchOgpMetadata(
      "https://example.co.jp/%E3%83%AC%E3%83%9D%E3%83%BC%E3%83%88.pdf",
    );

    expect(result?.title).toBe("レポート");
  });
});
