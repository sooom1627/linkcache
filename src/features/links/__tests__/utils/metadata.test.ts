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
    (getLinkPreview as jest.Mock).mockResolvedValueOnce({
      url: "https://example.com",
      title: "Example Title",
      description: "Example Description",
      images: ["https://example.com/image.jpg"],
      favicons: ["https://example.com/favicon.ico"],
      siteName: "Example Site",
      mediaType: "website",
    });

    const result = await fetchOgpMetadata("https://example.com");

    expect(getLinkPreview).toHaveBeenCalledWith("https://example.com", {
      timeout: 5000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LinkCache/1.0; +https://linkcache.app)",
      },
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
    (getLinkPreview as jest.Mock).mockResolvedValueOnce({
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
    });

    const result = await fetchOgpMetadata("https://example.com");

    expect(result?.image_url).toBe("https://example.com/image1.jpg");
    expect(result?.favicon_url).toBe("https://example.com/favicon1.ico");
  });

  it("handles missing optional fields", async () => {
    (getLinkPreview as jest.Mock).mockResolvedValueOnce({
      url: "https://example.com",
      title: "Title Only",
      mediaType: "website",
      // description, images, favicons, siteName are missing
    });

    const result = await fetchOgpMetadata("https://example.com");

    expect(result).toEqual({
      title: "Title Only",
      description: null,
      image_url: null,
      site_name: null,
      favicon_url: null,
    });
  });

  it("handles empty arrays for images and favicons", async () => {
    (getLinkPreview as jest.Mock).mockResolvedValueOnce({
      url: "https://example.com",
      title: "Title",
      description: "Description",
      images: [],
      favicons: [],
      siteName: "Site",
      mediaType: "website",
    });

    const result = await fetchOgpMetadata("https://example.com");

    expect(result?.image_url).toBeNull();
    expect(result?.favicon_url).toBeNull();
  });

  it("returns null when fetch fails", async () => {
    (getLinkPreview as jest.Mock).mockRejectedValueOnce(
      new Error("Network error"),
    );

    const result = await fetchOgpMetadata("https://example.com");

    expect(result).toBeNull();
  });

  it("returns null for non-website media types", async () => {
    (getLinkPreview as jest.Mock).mockResolvedValueOnce({
      url: "https://example.com/video.mp4",
      mediaType: "video",
    });

    const result = await fetchOgpMetadata("https://example.com/video.mp4");

    expect(result).toBeNull();
  });

  it("handles audio media type as non-website", async () => {
    (getLinkPreview as jest.Mock).mockResolvedValueOnce({
      url: "https://example.com/audio.mp3",
      mediaType: "audio",
    });

    const result = await fetchOgpMetadata("https://example.com/audio.mp3");

    expect(result).toBeNull();
  });
});
