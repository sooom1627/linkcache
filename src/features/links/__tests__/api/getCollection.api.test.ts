import { supabase } from "@/src/shared/lib/supabase";

import { getCollection } from "../../api/getCollection.api";

const mockSelect = jest.fn();
const mockEq = jest.fn();
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
      select: mockSelect,
    })),
  },
}));

const MOCK_USER_ID = "550e8400-e29b-41d4-a716-446655440001";
const MOCK_COLLECTION_ID = "660e8400-e29b-41d4-a716-446655440002";
const MOCK_COLLECTION = {
  id: MOCK_COLLECTION_ID,
  user_id: MOCK_USER_ID,
  name: "Work",
  emoji: "💼",
  created_at: "2026-02-15T00:00:00Z",
  updated_at: "2026-02-15T00:00:00Z",
  collection_links: [{ count: 24 }],
};

describe("getCollection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: MOCK_USER_ID } },
      error: null,
    });
    mockSingle.mockResolvedValue({ data: MOCK_COLLECTION, error: null });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSelect.mockReturnValue({ eq: mockEq });
  });

  it("calls Supabase select, eq, single with correct parameters", async () => {
    await getCollection(MOCK_COLLECTION_ID);

    expect(supabase.from).toHaveBeenCalledWith("collections");
    expect(mockSelect).toHaveBeenCalledWith("*, collection_links(count)");
    expect(mockEq).toHaveBeenCalledWith("id", MOCK_COLLECTION_ID);
    expect(mockSingle).toHaveBeenCalled();
  });

  it("returns CollectionWithCount when select succeeds", async () => {
    const result = await getCollection(MOCK_COLLECTION_ID);

    expect(result).toEqual({
      id: MOCK_COLLECTION_ID,
      name: "Work",
      emoji: "💼",
      itemsCount: 24,
    });
  });

  it("returns itemsCount 0 when collection_links is empty or missing", async () => {
    const collectionWithoutLinks = {
      ...MOCK_COLLECTION,
      collection_links: [],
    };
    mockSingle.mockResolvedValueOnce({
      data: collectionWithoutLinks,
      error: null,
    });

    const result = await getCollection(MOCK_COLLECTION_ID);

    expect(result.itemsCount).toBe(0);
  });

  it("throws error when Supabase returns an error", async () => {
    const mockError = { message: "Database error", code: "PGRST001" };
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: mockError,
    });

    await expect(getCollection(MOCK_COLLECTION_ID)).rejects.toEqual(mockError);
  });

  it("throws error when not found (PGRST116)", async () => {
    const notFoundError = { message: "Row not found", code: "PGRST116" };
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: notFoundError,
    });

    await expect(getCollection("non-existent-id")).rejects.toEqual(
      notFoundError,
    );
  });

  it("throws error when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    await expect(getCollection(MOCK_COLLECTION_ID)).rejects.toThrow(
      "Not authenticated",
    );
  });
});
