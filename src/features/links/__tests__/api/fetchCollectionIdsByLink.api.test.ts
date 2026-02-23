import { supabase } from "@/src/shared/lib/supabase";

import { fetchCollectionIdsByLink } from "../../api/fetchCollectionIdsByLink.api";

const mockSelect = jest.fn();
const mockEq = jest.fn();
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
      select: mockSelect.mockReturnValue({
        eq: mockEq,
      }),
    })),
  },
}));

const MOCK_LINK_ID = "770e8400-e29b-41d4-a716-446655440002";
const MOCK_COLLECTION_IDS = [
  "660e8400-e29b-41d4-a716-446655440001",
  "660e8400-e29b-41d4-a716-446655440003",
];

describe("fetchCollectionIdsByLink", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
  });

  it("returns collection_id array on success", async () => {
    const mockRows = MOCK_COLLECTION_IDS.map((id) => ({ collection_id: id }));
    mockEq.mockResolvedValueOnce({
      data: mockRows,
      error: null,
    });

    const result = await fetchCollectionIdsByLink(MOCK_LINK_ID);

    expect(supabase.from).toHaveBeenCalledWith("collection_links");
    expect(mockSelect).toHaveBeenCalledWith("collection_id");
    expect(mockEq).toHaveBeenCalledWith("link_id", MOCK_LINK_ID);
    expect(result).toEqual(MOCK_COLLECTION_IDS);
  });

  it("returns empty array when no collections linked", async () => {
    mockEq.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const result = await fetchCollectionIdsByLink(MOCK_LINK_ID);

    expect(result).toEqual([]);
  });

  it("throws when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    await expect(fetchCollectionIdsByLink(MOCK_LINK_ID)).rejects.toThrow(
      "Not authenticated",
    );
  });

  it("rethrows PostgrestError on failure (preserves code/details/hint)", async () => {
    const mockError = { message: "database error", code: "PGRST001" };
    mockEq.mockResolvedValueOnce({
      data: null,
      error: mockError,
    });

    await expect(fetchCollectionIdsByLink(MOCK_LINK_ID)).rejects.toMatchObject({
      message: "database error",
      code: "PGRST001",
    });
  });
});
