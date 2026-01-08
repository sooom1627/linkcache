import { supabase } from "@/src/shared/lib/supabase";

import { updateLinkReadStatus } from "../../api/updateLinkReadStatus.api";

// Supabaseクライアントのモック
jest.mock("@/src/shared/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockSupabase = jest.mocked(supabase);

// テスト用の有効なUUID
const MOCK_LINK_ID = "550e8400-e29b-41d4-a716-446655440000";

describe("updateLinkReadStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sets read_at to current timestamp when marking as read", async () => {
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        error: null,
      }),
    });

    mockSupabase.from.mockReturnValue({
      update: mockUpdate,
    } as unknown as ReturnType<typeof supabase.from>);

    await updateLinkReadStatus(MOCK_LINK_ID, true);

    expect(mockSupabase.from).toHaveBeenCalledWith("link_status");
    expect(mockUpdate).toHaveBeenCalled();
    // mock.callsはunknown[][]型として扱い、適切に型アサーションを行う
    const firstCall = mockUpdate.mock.calls[0] as
      | [{ read_at: string }]
      | undefined;
    if (firstCall?.[0]) {
      const updateCall = firstCall[0];
      expect(updateCall.read_at).toBeDefined();
      expect(updateCall.read_at).not.toBeNull();
    }
  });

  it("sets read_at to null when marking as unread", async () => {
    const mockEq = jest.fn().mockResolvedValue({
      error: null,
    });
    const mockUpdate = jest.fn().mockReturnValue({
      eq: mockEq,
    });

    mockSupabase.from.mockReturnValue({
      update: mockUpdate,
    } as unknown as ReturnType<typeof supabase.from>);

    await updateLinkReadStatus(MOCK_LINK_ID, false);

    expect(mockSupabase.from).toHaveBeenCalledWith("link_status");
    expect(mockUpdate).toHaveBeenCalledWith({ read_at: null });
    expect(mockEq).toHaveBeenCalledWith("link_id", MOCK_LINK_ID);
  });

  it("throws error when Supabase update fails", async () => {
    const mockError = {
      message: "Database error",
      code: "PGRST116",
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

    await expect(updateLinkReadStatus(MOCK_LINK_ID, true)).rejects.toThrow(
      "Failed to update link read status: Database error",
    );
  });
});
