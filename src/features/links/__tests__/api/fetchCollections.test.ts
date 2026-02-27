import { supabase } from "@/src/shared/lib/supabase";

import { fetchCollections } from "../../api/fetchCollections.api";

const mockSelect = jest.fn();
const mockGetUser = jest.fn();

type GetUserResponse = {
  data: { user: { id: string } | null };
  error: null;
};

function createSelectChain(resolvedValue: {
  data: unknown;
  error: { message: string; code: string } | null;
}) {
  const promise = Promise.resolve(resolvedValue);
  const chain = {
    order: jest.fn(),
    limit: jest.fn(),
    overrideTypes: jest.fn(),
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
  };
  chain.order.mockReturnValue(chain);
  chain.limit.mockReturnValue(chain);
  chain.overrideTypes.mockReturnValue(promise);
  return chain;
}

jest.mock("@/src/shared/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: (): Promise<GetUserResponse> =>
        mockGetUser() as Promise<GetUserResponse>,
    },
    from: jest.fn(() => ({ select: mockSelect })),
  },
}));

const MOCK_USER_ID = "550e8400-e29b-41d4-a716-446655440001";
const MOCK_COLLECTION_1 = {
  id: "col-1",
  user_id: MOCK_USER_ID,
  name: "Work",
  emoji: "💼",
  created_at: "2026-02-15T00:00:00Z",
  updated_at: "2026-02-15T00:00:00Z",
  collection_links: [{ count: 24 }],
};
const MOCK_COLLECTION_2 = {
  id: "col-2",
  user_id: MOCK_USER_ID,
  name: "Design",
  emoji: "🎨",
  created_at: "2026-02-15T00:00:00Z",
  updated_at: "2026-02-15T00:00:00Z",
  collection_links: [],
};

describe("fetchCollections", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: MOCK_USER_ID } },
      error: null,
    });
  });

  it("returns mapped collections with correct shape and itemsCount fallback", async () => {
    const chain = createSelectChain({
      data: [MOCK_COLLECTION_1, MOCK_COLLECTION_2],
      error: null,
    });
    mockSelect.mockReturnValueOnce(chain);

    const result = await fetchCollections();

    expect(supabase.from).toHaveBeenCalledWith("collections");
    expect(mockSelect).toHaveBeenCalledWith("*, collection_links(count)");
    expect(chain.order).toHaveBeenCalledWith("updated_at", {
      ascending: false,
    });
    expect(result).toEqual([
      { id: "col-1", name: "Work", emoji: "💼", itemsCount: 24 },
      { id: "col-2", name: "Design", emoji: "🎨", itemsCount: 0 },
    ]);
  });

  it.each([
    ["asc", true],
    ["desc", false],
  ] as const)(
    "applies order=%s and limit params correctly",
    async (order, ascending) => {
      const chain = createSelectChain({
        data: [MOCK_COLLECTION_1],
        error: null,
      });
      mockSelect.mockReturnValueOnce(chain);

      await fetchCollections({ order, limit: 5 });

      expect(chain.order).toHaveBeenCalledWith("updated_at", { ascending });
      expect(chain.limit).toHaveBeenCalledWith(5);
    },
  );

  it("throws when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    await expect(fetchCollections()).rejects.toThrow("Not authenticated");
  });

  it("throws when Supabase returns an error", async () => {
    const mockError = { message: "Database error", code: "PGRST001" };
    mockSelect.mockReturnValueOnce(
      createSelectChain({ data: null, error: mockError }),
    );

    await expect(fetchCollections()).rejects.toEqual(mockError);
  });
});
