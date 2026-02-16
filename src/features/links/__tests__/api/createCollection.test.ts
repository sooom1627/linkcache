import { supabase } from "@/src/shared/lib/supabase";

import { createCollection } from "../../api/createCollection.api";

// Supabaseクライアントのモック
const mockInsert = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();
const mockGetUser = jest.fn();

type GetUserResponse = {
  data: { user: { id: string } | null };
  error: null;
};

jest.mock("@/src/shared/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: (): Promise<GetUserResponse> =>
        mockGetUser() as Promise<GetUserResponse>,
    },
    from: jest.fn(() => ({
      insert: mockInsert.mockReturnValue({
        select: mockSelect.mockReturnValue({
          single: mockSingle,
        }),
      }),
    })),
  },
}));

const MOCK_USER_ID = "550e8400-e29b-41d4-a716-446655440001";
const MOCK_COLLECTION_ID = "550e8400-e29b-41d4-a716-446655440000";

describe("createCollection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: MOCK_USER_ID } },
      error: null,
    });
  });

  it("calls Supabase insert with correct parameters", async () => {
    const mockCollection = {
      id: MOCK_COLLECTION_ID,
      user_id: MOCK_USER_ID,
      name: "My Collection",
      emoji: "📚",
      created_at: "2026-02-15T00:00:00Z",
      updated_at: "2026-02-15T00:00:00Z",
    };
    mockInsert.mockReturnValue({
      select: mockSelect.mockReturnValue({
        single: mockSingle.mockResolvedValueOnce({
          data: mockCollection,
          error: null,
        }),
      }),
    });

    const params = {
      name: "My Collection",
      emoji: "📚",
    };

    const result = await createCollection(params);

    expect(supabase.from).toHaveBeenCalledWith("collections");
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: MOCK_USER_ID,
      name: "My Collection",
      emoji: "📚",
    });
    expect(result).toEqual(mockCollection);
    expect(result.id).toBe(MOCK_COLLECTION_ID);
    expect(result.name).toBe("My Collection");
    expect(result.emoji).toBe("📚");
  });

  it("returns Collection with id, name, emoji when insert succeeds", async () => {
    const mockCollection = {
      id: MOCK_COLLECTION_ID,
      user_id: MOCK_USER_ID,
      name: "Test",
      emoji: null,
      created_at: "2026-02-15T00:00:00Z",
      updated_at: "2026-02-15T00:00:00Z",
    };
    mockInsert.mockReturnValue({
      select: mockSelect.mockReturnValue({
        single: mockSingle.mockResolvedValueOnce({
          data: mockCollection,
          error: null,
        }),
      }),
    });

    const result = await createCollection({ name: "Test" });

    expect(result).toEqual(mockCollection);
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: MOCK_USER_ID,
      name: "Test",
      emoji: null,
    });
  });

  it("throws error when Supabase returns an error", async () => {
    const mockError = {
      message: "Duplicate key",
      code: "23505",
    };
    mockInsert.mockReturnValue({
      select: mockSelect.mockReturnValue({
        single: mockSingle.mockResolvedValueOnce({
          data: null,
          error: mockError,
        }),
      }),
    });

    await expect(createCollection({ name: "My Collection" })).rejects.toEqual(
      mockError,
    );
  });

  it("throws error when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    await expect(createCollection({ name: "My Collection" })).rejects.toThrow(
      "Not authenticated",
    );
  });
});
