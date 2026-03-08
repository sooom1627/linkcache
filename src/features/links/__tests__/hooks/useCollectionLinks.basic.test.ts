import { renderHook, waitFor } from "@testing-library/react-native";

import { createMockLink } from "../../__mocks__/linkHelpers";
import { fetchUserLinks } from "../../api/fetchLinks.api";
import { collectionQueryKeys } from "../../constants/queryKeys";
import { useCollectionLinks } from "../../hooks/useCollectionLinks";
import { clearQueryCache, testQueryClient, wrapper } from "../test-utils";

jest.mock("../../api/fetchLinks.api", () => ({
  fetchUserLinks: jest.fn(),
}));

const mockFetchUserLinks = jest.mocked(fetchUserLinks);

const MOCK_COLLECTION_ID = "col-abc-123";

describe("useCollectionLinks - basic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearQueryCache();
  });

  afterEach(() => {
    clearQueryCache();
  });

  it("collectionIdを指定してリンク一覧を取得する", async () => {
    const mockData = {
      data: [
        createMockLink(1, { status: "new" }),
        createMockLink(2, { status: "read_soon" }),
      ],
      hasMore: false,
      totalCount: 2,
    };
    mockFetchUserLinks.mockResolvedValueOnce(mockData);

    const { result } = renderHook(
      () => useCollectionLinks(MOCK_COLLECTION_ID),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetchUserLinks).toHaveBeenCalledWith({
      collectionId: MOCK_COLLECTION_ID,
      pageSize: 20,
      page: 0,
    });
    expect(result.current.links).toHaveLength(2);
    expect(result.current.links[0].title).toBe("Example 1");
    expect(result.current.isError).toBe(false);
  });

  it("collectionIdが空文字のときはクエリを実行しない", async () => {
    const { result } = renderHook(() => useCollectionLinks(""), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetchUserLinks).not.toHaveBeenCalled();
    expect(result.current.links).toEqual([]);
  });

  it("collectionQueryKeys.links をクエリキーとして使用する", async () => {
    mockFetchUserLinks.mockResolvedValueOnce({
      data: [],
      hasMore: false,
      totalCount: 0,
    });

    const { result } = renderHook(
      () => useCollectionLinks(MOCK_COLLECTION_ID),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const queryCache = testQueryClient.getQueryCache();
    const queries = queryCache.findAll({
      queryKey: collectionQueryKeys.links(MOCK_COLLECTION_ID),
    });
    expect(queries).toHaveLength(1);
  });

  it("filterParamsを指定するとfetchUserLinksにstatusとisReadが渡される", async () => {
    mockFetchUserLinks.mockResolvedValueOnce({
      data: [],
      hasMore: false,
      totalCount: 0,
    });

    const { result } = renderHook(
      () =>
        useCollectionLinks(MOCK_COLLECTION_ID, {
          status: "read_soon",
          isRead: false,
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetchUserLinks).toHaveBeenCalledWith({
      collectionId: MOCK_COLLECTION_ID,
      pageSize: 20,
      page: 0,
      status: "read_soon",
      isRead: false,
    });
  });

  it("filterParams指定時はクエリキーにfilterParamsが含まれる", async () => {
    mockFetchUserLinks.mockResolvedValueOnce({
      data: [],
      hasMore: false,
      totalCount: 0,
    });

    const filterParams = { status: "done" as const, isRead: true };
    const { result } = renderHook(
      () => useCollectionLinks(MOCK_COLLECTION_ID, filterParams),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const queryCache = testQueryClient.getQueryCache();
    const queries = queryCache.findAll({
      queryKey: collectionQueryKeys.links(MOCK_COLLECTION_ID, filterParams),
    });
    expect(queries).toHaveLength(1);
  });

  it("selectを経由してlink_created_atが返される", async () => {
    mockFetchUserLinks.mockResolvedValueOnce({
      data: [createMockLink(1)],
      hasMore: false,
      totalCount: 1,
    });

    const { result } = renderHook(
      () => useCollectionLinks(MOCK_COLLECTION_ID),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.links[0].link_created_at).toBe(
      "2024-01-01T00:00:00Z",
    );
    expect(result.current.links[0].status).toBe("new");
  });
});
