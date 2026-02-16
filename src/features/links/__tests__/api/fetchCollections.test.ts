import { supabase } from "@/src/shared/lib/supabase";

import { fetchCollections } from "../../api/fetchCollections.api";

const mockSelect = jest.fn();
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
      select: mockSelect,
    })),
  },
}));

const MOCK_USER_ID = "550e8400-e29b-41d4-a716-446655440001";
const MOCK_COLLECTION_1 = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  user_id: MOCK_USER_ID,
  name: "Work",
  emoji: "💼",
  created_at: "2026-02-15T00:00:00Z",
  updated_at: "2026-02-15T00:00:00Z",
  collection_links: [{ count: 24 }],
};
const MOCK_COLLECTION_2 = {
  id: "550e8400-e29b-41d4-a716-446655440002",
  user_id: MOCK_USER_ID,
  name: "Design",
  emoji: "🎨",
  created_at: "2026-02-15T00:00:00Z",
  updated_at: "2026-02-15T00:00:00Z",
  collection_links: [{ count: 0 }],
};

describe("fetchCollections", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: MOCK_USER_ID } },
      error: null,
    });
  });

  it("calls Supabase select with correct parameters", async () => {
    mockSelect.mockResolvedValueOnce({
      data: [MOCK_COLLECTION_1],
      error: null,
    });

    await fetchCollections();

    expect(supabase.from).toHaveBeenCalledWith("collections");
    expect(mockSelect).toHaveBeenCalledWith("*, collection_links(count)");
  });

  it("returns collections with id, name, emoji, itemsCount when select succeeds", async () => {
    mockSelect.mockResolvedValueOnce({
      data: [MOCK_COLLECTION_1, MOCK_COLLECTION_2],
      error: null,
    });

    const result = await fetchCollections();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: MOCK_COLLECTION_1.id,
      name: "Work",
      emoji: "💼",
      itemsCount: 24,
    });
    expect(result[1]).toEqual({
      id: MOCK_COLLECTION_2.id,
      name: "Design",
      emoji: "🎨",
      itemsCount: 0,
    });
  });

  it("returns itemsCount 0 when collection_links is empty or missing", async () => {
    const collectionWithoutLinks = {
      ...MOCK_COLLECTION_1,
      collection_links: [],
    };
    mockSelect.mockResolvedValueOnce({
      data: [collectionWithoutLinks],
      error: null,
    });

    const result = await fetchCollections();

    expect(result[0].itemsCount).toBe(0);
  });

  it("throws error when Supabase returns an error", async () => {
    const mockError = { message: "Database error", code: "PGRST001" };
    mockSelect.mockResolvedValueOnce({
      data: null,
      error: mockError,
    });

    await expect(fetchCollections()).rejects.toEqual(mockError);
  });

  it("throws error when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    await expect(fetchCollections()).rejects.toThrow("Not authenticated");
  });
});
