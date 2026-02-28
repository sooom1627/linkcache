import { fetchCollections } from "../../api/fetchCollections.api";

const mockRpc = jest.fn();
const mockGetUser = jest.fn();

jest.mock("@/src/shared/lib/supabase", () => ({
  supabase: {
    auth: { getUser: () => mockGetUser() },
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

const MOCK_COLLECTION_1 = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  name: "Work",
  emoji: "💼",
  items_count: 24,
};

const MOCK_COLLECTION_2 = {
  id: "550e8400-e29b-41d4-a716-446655440002",
  name: "Design",
  emoji: null,
  items_count: 0,
};

describe("fetchCollections", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
  });

  it("calls RPC with default params and maps response correctly", async () => {
    mockRpc.mockResolvedValueOnce({
      data: [MOCK_COLLECTION_1, MOCK_COLLECTION_2],
      error: null,
    });

    const result = await fetchCollections();

    expect(mockRpc).toHaveBeenCalledWith("get_user_collections", {
      p_order_by: "updated_at",
      p_order: "desc",
      p_limit: null,
    });
    expect(result).toEqual([
      { id: MOCK_COLLECTION_1.id, name: "Work", emoji: "💼", itemsCount: 24 },
      {
        id: MOCK_COLLECTION_2.id,
        name: "Design",
        emoji: null,
        itemsCount: 0,
      },
    ]);
  });

  it("passes orderBy, order, and limit params to RPC", async () => {
    mockRpc.mockResolvedValueOnce({
      data: [MOCK_COLLECTION_1],
      error: null,
    });

    await fetchCollections({
      orderBy: "items_count",
      order: "asc",
      limit: 5,
    });

    expect(mockRpc).toHaveBeenCalledWith("get_user_collections", {
      p_order_by: "items_count",
      p_order: "asc",
      p_limit: 5,
    });
  });

  it("throws when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    await expect(fetchCollections()).rejects.toThrow("Not authenticated");
  });

  it("throws when RPC returns an error", async () => {
    mockRpc.mockResolvedValueOnce({
      data: null,
      error: { message: "Database error", code: "PGRST001" },
    });

    await expect(fetchCollections()).rejects.toThrow("Database error");
  });

  it("throws when RPC response fails Zod validation", async () => {
    mockRpc.mockResolvedValueOnce({
      data: [{ id: "not-a-uuid", name: 123 }],
      error: null,
    });

    await expect(fetchCollections()).rejects.toThrow();
  });
});
