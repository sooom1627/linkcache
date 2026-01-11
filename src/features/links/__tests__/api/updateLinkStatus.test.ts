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

  it("updates link status to later and sets triaged_at", async () => {
    const mockEq = jest.fn().mockResolvedValue({
      error: null,
    });
    const mockUpdate = jest.fn().mockReturnValue({
      eq: mockEq,
    });

    mockSupabase.from.mockReturnValue({
      update: mockUpdate,
    } as unknown as ReturnType<typeof supabase.from>);

    await updateLinkStatus(MOCK_LINK_ID, "later");

    expect(mockSupabase.from).toHaveBeenCalledWith("link_status");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "later",
        triaged_at: expect.any(String) as string,
      }),
    );
    expect(mockEq).toHaveBeenCalledWith("link_id", MOCK_LINK_ID);
  });

  it("sets triaged_at to current ISO timestamp", async () => {
    const mockEq = jest.fn().mockResolvedValue({
      error: null,
    });
    const mockUpdate = jest.fn().mockReturnValue({
      eq: mockEq,
    });

    mockSupabase.from.mockReturnValue({
      update: mockUpdate,
    } as unknown as ReturnType<typeof supabase.from>);

    const beforeUpdate = new Date().toISOString();
    await updateLinkStatus(MOCK_LINK_ID, "read_soon");
    const afterUpdate = new Date().toISOString();

    const firstCall = mockUpdate.mock.calls[0] as
      | [{ status: string; triaged_at: string }]
      | undefined;
    if (firstCall?.[0]) {
      const updateCall = firstCall[0];
      expect(updateCall.triaged_at).toBeDefined();
      expect(updateCall.triaged_at).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
      );
      expect(updateCall.triaged_at >= beforeUpdate).toBe(true);
      expect(updateCall.triaged_at <= afterUpdate).toBe(true);
    }
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

  it("throws error with correct error message format", async () => {
    const mockError = {
      message: "Not authenticated",
      code: "AUTH001",
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

    await expect(updateLinkStatus(MOCK_LINK_ID, "later")).rejects.toThrow(
      "Failed to update link status: Not authenticated",
    );
  });
});
