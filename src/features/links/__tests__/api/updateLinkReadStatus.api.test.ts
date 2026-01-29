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
    const mockEq = jest.fn().mockResolvedValue({
      error: null,
    });
    const mockUpdate = jest.fn().mockReturnValue({
      eq: mockEq,
    });

    mockSupabase.from.mockReturnValue({
      update: mockUpdate,
    } as unknown as ReturnType<typeof supabase.from>);

    await updateLinkReadStatus(MOCK_LINK_ID, true);

    expect(mockSupabase.from).toHaveBeenCalledWith("link_status");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        read_at: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
        ) as unknown as string,
      }),
    );
    // statusがundefinedの場合は、更新ペイロードにstatusフィールドを含めない
    expect(mockUpdate.mock.calls.length).toBeGreaterThan(0);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const updateCall = mockUpdate.mock.calls[0][0] as {
      read_at: string;
      status?: unknown;
    };
    expect(updateCall).toBeDefined();
    expect(updateCall).not.toHaveProperty("status");
    expect(mockEq).toHaveBeenCalledWith("link_id", MOCK_LINK_ID);
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
    expect(mockUpdate).toHaveBeenCalledWith({
      read_at: null,
    });
    // statusがundefinedの場合は、更新ペイロードにstatusフィールドを含めない
    expect(mockUpdate.mock.calls.length).toBeGreaterThan(0);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const updateCall = mockUpdate.mock.calls[0][0] as {
      read_at: null;
      status?: unknown;
    };
    expect(updateCall).toBeDefined();
    expect(updateCall).not.toHaveProperty("status");
    expect(mockEq).toHaveBeenCalledWith("link_id", MOCK_LINK_ID);
  });

  it("updates status when provided", async () => {
    const mockEq = jest.fn().mockResolvedValue({
      error: null,
    });
    const mockUpdate = jest.fn().mockReturnValue({
      eq: mockEq,
    });

    mockSupabase.from.mockReturnValue({
      update: mockUpdate,
    } as unknown as ReturnType<typeof supabase.from>);

    await updateLinkReadStatus(MOCK_LINK_ID, true, "done");

    expect(mockSupabase.from).toHaveBeenCalledWith("link_status");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        read_at: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
        ) as unknown as string,
        status: "done",
      }),
    );
    expect(mockEq).toHaveBeenCalledWith("link_id", MOCK_LINK_ID);
  });

  it("does not include status in update payload when status is undefined", async () => {
    const mockEq = jest.fn().mockResolvedValue({
      error: null,
    });
    const mockUpdate = jest.fn().mockReturnValue({
      eq: mockEq,
    });

    mockSupabase.from.mockReturnValue({
      update: mockUpdate,
    } as unknown as ReturnType<typeof supabase.from>);

    await updateLinkReadStatus(MOCK_LINK_ID, true);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        read_at: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
        ) as unknown as string,
      }),
    );
    // statusがundefinedの場合は、更新ペイロードにstatusフィールドを含めない
    expect(mockUpdate.mock.calls.length).toBeGreaterThan(0);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const updateCall = mockUpdate.mock.calls[0][0] as {
      read_at: string;
      status?: unknown;
    };
    expect(updateCall).toBeDefined();
    expect(updateCall).not.toHaveProperty("status");
  });

  it("sets status to null when explicitly provided as null", async () => {
    const mockEq = jest.fn().mockResolvedValue({
      error: null,
    });
    const mockUpdate = jest.fn().mockReturnValue({
      eq: mockEq,
    });

    mockSupabase.from.mockReturnValue({
      update: mockUpdate,
    } as unknown as ReturnType<typeof supabase.from>);

    await updateLinkReadStatus(MOCK_LINK_ID, true, null);

    expect(mockUpdate).toHaveBeenCalledWith({
      read_at: expect.stringMatching(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
      ) as unknown as string,
      status: null,
    });
  });

  it("updates status to read_soon when marking as unread with status", async () => {
    const mockEq = jest.fn().mockResolvedValue({
      error: null,
    });
    const mockUpdate = jest.fn().mockReturnValue({
      eq: mockEq,
    });

    mockSupabase.from.mockReturnValue({
      update: mockUpdate,
    } as unknown as ReturnType<typeof supabase.from>);

    await updateLinkReadStatus(MOCK_LINK_ID, false, "read_soon");

    expect(mockUpdate).toHaveBeenCalledWith({
      read_at: null,
      status: "read_soon",
    });
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
