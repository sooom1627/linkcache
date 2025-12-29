import { supabase } from "@/src/shared/lib/supabase";

import { createLinkWithStatus } from "../../api/createLink.api";

// Supabaseクライアントのモック
jest.mock("@/src/shared/lib/supabase", () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

// テスト用の有効なUUID
const MOCK_UUID_1 = "550e8400-e29b-41d4-a716-446655440000";
const MOCK_UUID_2 = "123e4567-e89b-12d3-a456-426614174000";

describe("createLinkWithStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls Supabase RPC with correct parameters", async () => {
    const mockResponse = {
      data: {
        link_id: MOCK_UUID_1,
        url: "https://example.com",
        status: "inbox",
      },
      error: null,
    };
    (supabase.rpc as jest.Mock).mockResolvedValueOnce(mockResponse);

    const params = {
      url: "https://example.com",
      title: "Example Title",
      description: "Example Description",
      image_url: "https://example.com/image.jpg",
      favicon_url: "https://example.com/favicon.ico",
      site_name: "Example Site",
    };

    const result = await createLinkWithStatus(params);

    expect(supabase.rpc).toHaveBeenCalledWith("create_link_with_status", {
      p_url: "https://example.com",
      p_title: "Example Title",
      p_description: "Example Description",
      p_image_url: "https://example.com/image.jpg",
      p_favicon_url: "https://example.com/favicon.ico",
      p_site_name: "Example Site",
    });
    expect(result).toEqual({
      link_id: MOCK_UUID_1,
      url: "https://example.com",
      status: "inbox",
    });
  });

  it("calls RPC with null values for optional parameters", async () => {
    const mockResponse = {
      data: {
        link_id: MOCK_UUID_1,
        url: "https://example.com",
        status: "inbox",
      },
      error: null,
    };
    (supabase.rpc as jest.Mock).mockResolvedValueOnce(mockResponse);

    const params = {
      url: "https://example.com",
    };

    await createLinkWithStatus(params);

    expect(supabase.rpc).toHaveBeenCalledWith("create_link_with_status", {
      p_url: "https://example.com",
      p_title: null,
      p_description: null,
      p_image_url: null,
      p_favicon_url: null,
      p_site_name: null,
    });
  });

  it("throws error when RPC returns an error", async () => {
    const mockError = {
      message: "Not authenticated",
      code: "AUTH001",
    };
    (supabase.rpc as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: mockError,
    });

    const params = { url: "https://example.com" };

    await expect(createLinkWithStatus(params)).rejects.toEqual(mockError);
  });

  it("handles RPC response correctly", async () => {
    const mockResponse = {
      data: {
        link_id: MOCK_UUID_2,
        url: "https://test.com",
        status: "inbox",
      },
      error: null,
    };
    (supabase.rpc as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await createLinkWithStatus({ url: "https://test.com" });

    expect(result.link_id).toBe(MOCK_UUID_2);
    expect(result.url).toBe("https://test.com");
    expect(result.status).toBe("inbox");
  });
});
