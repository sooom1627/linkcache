import { renderHook, waitFor } from "@testing-library/react-native";

import { fetchUserLinks } from "../../api/fetchLinks.api";
import { collectionQueryKeys } from "../../constants/queryKeys";
import { useCollectionLinks } from "../../hooks/useCollectionLinks";
import { clearQueryCache, testQueryClient, wrapper } from "../test-utils";

jest.mock("../../api/fetchLinks.api", () => ({
  fetchUserLinks: jest.fn(),
}));

const mockFetchUserLinks = jest.mocked(fetchUserLinks);

const MOCK_COLLECTION_ID = "col-abc-123";

const createMockLink = (
  id: number,
  status: "new" | "read_soon" | "stock" | "done" = "new",
) => ({
  status_id: `status-${id}`,
  user_id: "user-1",
  status,
  triaged_at: null,
  read_at: null,
  link_id: `link-${id}`,
  url: `https://example${id}.com`,
  title: `Example ${id}`,
  image_url: null,
  favicon_url: null,
  site_name: `Site ${id}`,
  link_created_at: `2024-01-0${id}T00:00:00Z`,
});

describe("useCollectionLinks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearQueryCache();
  });

  it("collectionIdを指定してリンク一覧を取得する", async () => {
    const mockData = {
      data: [createMockLink(1, "new"), createMockLink(2, "read_soon")],
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

  it("エラー時にisErrorを返す", async () => {
    const mockError = new Error("API Error");
    mockFetchUserLinks.mockRejectedValueOnce(mockError);

    const { result } = renderHook(
      () => useCollectionLinks(MOCK_COLLECTION_ID),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(mockError);
    expect(result.current.links).toEqual([]);
  });

  it("selectを経由してlink_created_atが返される", async () => {
    const mockData = {
      data: [createMockLink(1)],
      hasMore: false,
      totalCount: 1,
    };
    mockFetchUserLinks.mockResolvedValueOnce(mockData);

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

  it("返り値にlinks, isLoading, isError, error, refetchを含む", () => {
    mockFetchUserLinks.mockResolvedValueOnce({
      data: [],
      hasMore: false,
      totalCount: 0,
    });

    const { result } = renderHook(
      () => useCollectionLinks(MOCK_COLLECTION_ID),
      { wrapper },
    );

    expect(result.current).toHaveProperty("links");
    expect(result.current).toHaveProperty("isLoading");
    expect(result.current).toHaveProperty("isError");
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("refetch");
    expect(typeof result.current.refetch).toBe("function");
  });
});
