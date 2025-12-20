import { supabase } from "../../../../shared/lib/supabase";
import { createLink } from "../../api/createLink.api";
import type { LinkMetadata } from "../../utils/metadata";

// Supabaseのモック
jest.mock("../../../../shared/lib/supabase", () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

describe("createLink", () => {
  const mockUrl = "https://example.com";
  const mockMetadata: LinkMetadata = {
    title: "Example Title",
    description: "Example Description",
    image_url: "https://example.com/image.png",
    favicon_url: "https://example.com/favicon.ico",
    site_name: "Example Site",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully create a link", async () => {
    const mockResponse = {
      data: {
        link_id: "link-123",
        url: mockUrl,
        status: "inbox",
      },
      error: null,
    };

    (supabase.rpc as jest.Mock).mockResolvedValue(mockResponse);

    const result = await createLink(mockUrl, mockMetadata);

    expect(supabase.rpc).toHaveBeenCalledWith("create_link_with_status", {
      p_url: mockUrl,
      p_title: mockMetadata.title,
      p_description: mockMetadata.description,
      p_image_url: mockMetadata.image_url,
      p_favicon_url: mockMetadata.favicon_url,
      p_site_name: mockMetadata.site_name,
    });

    expect(result).toEqual(mockResponse.data);
  });

  it("should handle null metadata fields", async () => {
    const mockEmptyMetadata: LinkMetadata = {
      title: null,
      description: null,
      image_url: null,
      favicon_url: null,
      site_name: null,
    };

    const mockResponse = {
      data: {
        link_id: "link-456",
        url: mockUrl,
        status: "inbox",
      },
      error: null,
    };

    (supabase.rpc as jest.Mock).mockResolvedValue(mockResponse);

    const result = await createLink(mockUrl, mockEmptyMetadata);

    expect(supabase.rpc).toHaveBeenCalledWith("create_link_with_status", {
      p_url: mockUrl,
      p_title: null,
      p_description: null,
      p_image_url: null,
      p_favicon_url: null,
      p_site_name: null,
    });

    expect(result).toEqual(mockResponse.data);
  });

  it("should throw error when RPC fails", async () => {
    const mockError = {
      message: "Database error",
      code: "500",
    };

    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: null,
      error: mockError,
    });

    await expect(createLink(mockUrl, mockMetadata)).rejects.toEqual(mockError);
  });
});
