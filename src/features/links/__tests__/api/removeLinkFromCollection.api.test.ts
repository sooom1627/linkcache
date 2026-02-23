import { supabase } from "@/src/shared/lib/supabase";

import { removeLinkFromCollection } from "../../api/removeLinkFromCollection.api";

const mockEq2 = jest.fn();
const mockEq1 = jest.fn();
const mockDelete = jest.fn();
const mockGetUser = jest.fn();

type GetUserResponse = {
  data: { user: { id: string } | null };
  error: { message?: string } | null;
};

jest.mock("@/src/shared/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: (): Promise<GetUserResponse> =>
        mockGetUser() as Promise<GetUserResponse>,
    },
    from: jest.fn(() => ({
      delete: mockDelete,
    })),
  },
}));

const MOCK_COLLECTION_ID = "660e8400-e29b-41d4-a716-446655440001";
const MOCK_LINK_ID = "770e8400-e29b-41d4-a716-446655440002";

describe("removeLinkFromCollection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mockDelete.mockReturnValue({
      eq: mockEq1.mockReturnValue({
        eq: mockEq2.mockResolvedValue({ error: null }),
      }),
    });
  });

  it("calls Supabase delete with collection_id and link_id", async () => {
    await removeLinkFromCollection({
      collectionId: MOCK_COLLECTION_ID,
      linkId: MOCK_LINK_ID,
    });

    expect(supabase.from).toHaveBeenCalledWith("collection_links");
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq1).toHaveBeenCalledWith("collection_id", MOCK_COLLECTION_ID);
    expect(mockEq2).toHaveBeenCalledWith("link_id", MOCK_LINK_ID);
  });

  it("resolves without returning a value on success", async () => {
    const result = await removeLinkFromCollection({
      collectionId: MOCK_COLLECTION_ID,
      linkId: MOCK_LINK_ID,
    });

    expect(result).toBeUndefined();
  });

  it("throws when not authenticated (user is null)", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    await expect(
      removeLinkFromCollection({
        collectionId: MOCK_COLLECTION_ID,
        linkId: MOCK_LINK_ID,
      }),
    ).rejects.toThrow("Not authenticated");
  });

  it("throws when auth fails (authError non-null)", async () => {
    const mockAuthError = { message: "Session expired" };
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: mockAuthError,
    });

    await expect(
      removeLinkFromCollection({
        collectionId: MOCK_COLLECTION_ID,
        linkId: MOCK_LINK_ID,
      }),
    ).rejects.toThrow("Not authenticated");
  });

  it("throws Supabase error on delete failure", async () => {
    const mockError = { message: "delete failed", code: "42501" };
    mockDelete.mockReturnValue({
      eq: mockEq1.mockReturnValue({
        eq: mockEq2.mockResolvedValue({ error: mockError }),
      }),
    });

    await expect(
      removeLinkFromCollection({
        collectionId: MOCK_COLLECTION_ID,
        linkId: MOCK_LINK_ID,
      }),
    ).rejects.toEqual(mockError);
  });
});
