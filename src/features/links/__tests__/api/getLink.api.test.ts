import { supabase } from "@/src/shared/lib/supabase";

import { getLinkById } from "../../api/getLink.api";

// Supabase クライアントをモック
jest.mock("@/src/shared/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockFrom = jest.mocked(supabase.from);

describe("getLinkById", () => {
  const mockLinkId = "123e4567-e89b-12d3-a456-426614174000";
  const mockLinkData = {
    status_id: "223e4567-e89b-12d3-a456-426614174001",
    user_id: "323e4567-e89b-12d3-a456-426614174002",
    status: "read_soon" as const,
    triaged_at: "2025-01-01T00:00:00Z",
    read_at: null,
    link_id: mockLinkId,
    url: "https://example.com",
    title: "Example Title",
    description: "Example Description",
    image_url: "https://example.com/image.jpg",
    favicon_url: "https://example.com/favicon.ico",
    site_name: "Example Site",
    link_created_at: "2025-01-01T00:00:00Z",
  };

  let mockSingle: jest.Mock;
  let mockEq: jest.Mock;
  let mockSelect: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSingle = jest.fn();
    mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({
      select: mockSelect,
    } as unknown as ReturnType<typeof mockFrom>);
  });

  it("指定されたlink_idのリンクデータを取得できる", async () => {
    // Given: モックリンクデータ
    mockSingle.mockResolvedValue({ data: mockLinkData, error: null });

    // When: getLinkById(link_id)を呼び出す
    const result = await getLinkById(mockLinkId);

    // Then: 正しいUserLinkオブジェクトが返される
    expect(result).toEqual(mockLinkData);
  });

  it("存在しないlink_idの場合はエラーをthrowする", async () => {
    // Given: 存在しないlink_id
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: "Not found" },
    });

    // When & Then: getLinkById(link_id)を呼び出すとエラーがthrowされる
    await expect(getLinkById("non-existent-id")).rejects.toThrow(
      "Failed to fetch link: Not found",
    );
  });

  it("データが返されない場合はエラーをthrowする", async () => {
    // Given: データなし
    mockSingle.mockResolvedValue({ data: null, error: null });

    // When & Then: getLinkById(link_id)を呼び出すとエラーがthrowされる
    await expect(getLinkById(mockLinkId)).rejects.toThrow("Link not found");
  });

  it("Supabaseからのレスポンスをバリデーションする", async () => {
    // Given: 不正な形式のデータ（link_idが不正なUUID）
    const invalidData = { ...mockLinkData, link_id: "invalid-uuid" };
    mockSingle.mockResolvedValue({ data: invalidData, error: null });

    // When & Then: getLinkById(link_id)を呼び出すとバリデーションエラーがthrowされる
    await expect(getLinkById(mockLinkId)).rejects.toThrow();
  });
});
