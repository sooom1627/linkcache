import { supabase } from "@/src/shared/lib/supabase";

import { updateLinkStatus } from "../../api/updateLinkStatus.api";

// Supabaseクライアントのモック
jest.mock("@/src/shared/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockSupabase = jest.mocked(supabase);

// テスト用の有効なUUID
const MOCK_LINK_ID = "550e8400-e29b-41d4-a716-446655440000";

describe("updateLinkStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates link status to read_soon and sets triaged_at", async () => {
    const mockEq = jest.fn().mockResolvedValue({
      error: null,
    });
    const mockUpdate = jest.fn().mockReturnValue({
      eq: mockEq,
    });

    mockSupabase.from.mockReturnValue({
      update: mockUpdate,
    } as unknown as ReturnType<typeof supabase.from>);

    await updateLinkStatus(MOCK_LINK_ID, "read_soon");

    expect(mockSupabase.from).toHaveBeenCalledWith("link_status");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "read_soon",
        triaged_at: expect.any(String) as string,
      }),
    );
    expect(mockEq).toHaveBeenCalledWith("link_id", MOCK_LINK_ID);
  });

  it("updates link status to new", async () => {
    const mockEq = jest.fn().mockResolvedValue({
      error: null,
    });
    const mockUpdate = jest.fn().mockReturnValue({
      eq: mockEq,
    });

    mockSupabase.from.mockReturnValue({
      update: mockUpdate,
    } as unknown as ReturnType<typeof supabase.from>);

    await updateLinkStatus(MOCK_LINK_ID, "new");

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "new",
        triaged_at: expect.any(String) as string,
      }),
    );
  });

  it("updates link status to stock", async () => {
    const mockEq = jest.fn().mockResolvedValue({
      error: null,
    });
    const mockUpdate = jest.fn().mockReturnValue({
      eq: mockEq,
    });

    mockSupabase.from.mockReturnValue({
      update: mockUpdate,
    } as unknown as ReturnType<typeof supabase.from>);

    await updateLinkStatus(MOCK_LINK_ID, "stock");

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "stock",
        triaged_at: expect.any(String) as string,
      }),
    );
  });

  it("updates link status to done", async () => {
    const mockEq = jest.fn().mockResolvedValue({
      error: null,
    });
    const mockUpdate = jest.fn().mockReturnValue({
      eq: mockEq,
    });

    mockSupabase.from.mockReturnValue({
      update: mockUpdate,
    } as unknown as ReturnType<typeof supabase.from>);

    await updateLinkStatus(MOCK_LINK_ID, "done");

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "done",
        triaged_at: expect.any(String) as string,
      }),
    );
  });

  it("throws error when Supabase returns an error", async () => {
    const mockError = {
      message: "Update failed",
      code: "DB001",
    };

    const mockEq = jest.fn().mockResolvedValue({
      error: mockError,
    });
    const mockUpdate = jest.fn().mockReturnValue({
      eq: mockEq,
    });

    mockSupabase.from.mockReturnValue({
      update: mockUpdate,
    } as unknown as ReturnType<typeof supabase.from>);

    await expect(updateLinkStatus(MOCK_LINK_ID, "read_soon")).rejects.toThrow(
      "Failed to update link status: Update failed",
    );
  });
});
