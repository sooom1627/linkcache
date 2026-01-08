import { supabase } from "@/src/shared/lib/supabase";

import { deleteLinkById } from "../../api/deleteLink.api";

// Supabase クライアントをモック
jest.mock("@/src/shared/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockFrom = jest.mocked(supabase.from);

// テスト用の有効なUUID
const MOCK_LINK_ID = "550e8400-e29b-41d4-a716-446655440000";

describe("deleteLinkById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls Supabase delete with correct link_id", async () => {
    // Given: モック削除レスポンス
    const mockEq = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const mockDelete = jest.fn().mockReturnValue({
      eq: mockEq,
    });

    mockFrom.mockReturnValue({
      delete: mockDelete,
    } as unknown as ReturnType<typeof mockFrom>);

    // When: deleteLinkById(link_id)を呼び出す
    await deleteLinkById(MOCK_LINK_ID);

    // Then: 正しいパラメータでSupabaseが呼ばれる
    expect(mockFrom).toHaveBeenCalledWith("link_status");
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith("link_id", MOCK_LINK_ID);
  });

  it("throws error when Supabase returns an error", async () => {
    // Given: Supabaseエラー
    const mockError = {
      message: "Failed to delete link",
      code: "PGRST116",
    };
    const mockEq = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });
    const mockDelete = jest.fn().mockReturnValue({
      eq: mockEq,
    });

    mockFrom.mockReturnValue({
      delete: mockDelete,
    } as unknown as ReturnType<typeof mockFrom>);

    // When & Then: deleteLinkById(link_id)を呼び出すとエラーがthrowされる
    await expect(deleteLinkById(MOCK_LINK_ID)).rejects.toThrow(
      "Failed to delete link: Failed to delete link",
    );
  });

  it("handles successful deletion", async () => {
    // Given: 成功レスポンス
    const mockEq = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const mockDelete = jest.fn().mockReturnValue({
      eq: mockEq,
    });

    mockFrom.mockReturnValue({
      delete: mockDelete,
    } as unknown as ReturnType<typeof mockFrom>);

    // When & Then: deleteLinkById(link_id)が正常に完了する
    await expect(deleteLinkById(MOCK_LINK_ID)).resolves.toBeUndefined();
  });
});
