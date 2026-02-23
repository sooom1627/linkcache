import { supabase } from "@/src/shared/lib/supabase";

import { addLinkToCollection } from "../addLinkToCollection.api";

const mockInsert = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();
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
      insert: mockInsert.mockReturnValue({
        select: mockSelect.mockReturnValue({ single: mockSingle }),
      }),
    })),
  },
}));

const MOCK_COLLECTION_ID = "660e8400-e29b-41d4-a716-446655440001";
const MOCK_LINK_ID = "770e8400-e29b-41d4-a716-446655440002";

describe("addLinkToCollection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
  });

  it("calls Supabase insert with collection_id and link_id", async () => {
    mockInsert.mockReturnValue({
      select: mockSelect.mockReturnValue({
        single: mockSingle.mockResolvedValueOnce({
          data: { collection_id: MOCK_COLLECTION_ID, link_id: MOCK_LINK_ID },
          error: null,
        }),
      }),
    });

    await addLinkToCollection({
      collectionId: MOCK_COLLECTION_ID,
      linkId: MOCK_LINK_ID,
    });

    expect(supabase.from).toHaveBeenCalledWith("collection_links");
    expect(mockInsert).toHaveBeenCalledWith({
      collection_id: MOCK_COLLECTION_ID,
      link_id: MOCK_LINK_ID,
    });
  });

  it("returns CollectionLink on success", async () => {
    const mockData = {
      collection_id: MOCK_COLLECTION_ID,
      link_id: MOCK_LINK_ID,
    };
    mockInsert.mockReturnValue({
      select: mockSelect.mockReturnValue({
        single: mockSingle.mockResolvedValueOnce({
          data: mockData,
          error: null,
        }),
      }),
    });

    const result = await addLinkToCollection({
      collectionId: MOCK_COLLECTION_ID,
      linkId: MOCK_LINK_ID,
    });

    expect(result).toEqual(mockData);
  });

  it("throws when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    await expect(
      addLinkToCollection({
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
      addLinkToCollection({
        collectionId: MOCK_COLLECTION_ID,
        linkId: MOCK_LINK_ID,
      }),
    ).rejects.toThrow("Not authenticated");
  });

  it("throws Supabase error on failure", async () => {
    const mockError = { message: "duplicate key", code: "23505" };
    mockInsert.mockReturnValue({
      select: mockSelect.mockReturnValue({
        single: mockSingle.mockResolvedValueOnce({
          data: null,
          error: mockError,
        }),
      }),
    });

    await expect(
      addLinkToCollection({
        collectionId: MOCK_COLLECTION_ID,
        linkId: MOCK_LINK_ID,
      }),
    ).rejects.toEqual(mockError);
  });
});
