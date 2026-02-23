import { act, renderHook, waitFor } from "@testing-library/react-native";

import { createMockLink } from "../../__mocks__/linkHelpers";
import { fetchUserLinks } from "../../api/fetchLinks.api";
import { useCollectionLinks } from "../../hooks/useCollectionLinks";
import { clearQueryCache, wrapper } from "../test-utils";

jest.mock("../../api/fetchLinks.api", () => ({
  fetchUserLinks: jest.fn(),
}));

const mockFetchUserLinks = jest.mocked(fetchUserLinks);

const MOCK_COLLECTION_ID = "col-abc-123";

describe("useCollectionLinks - pagination & error", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    clearQueryCache();
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

  it("hasMoreがtrueのときfetchNextPageで次ページを取得する", async () => {
    const page0Data = {
      data: [createMockLink(1, { status: "new" })],
      hasMore: true,
      totalCount: 25,
    };
    const page1Data = {
      data: [createMockLink(2, { status: "read_soon" })],
      hasMore: false,
      totalCount: 25,
    };
    mockFetchUserLinks
      .mockResolvedValueOnce(page0Data)
      .mockResolvedValueOnce(page1Data);

    const { result } = renderHook(
      () => useCollectionLinks(MOCK_COLLECTION_ID),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.links).toHaveLength(1);
    expect(result.current.hasNextPage).toBe(true);

    act(() => {
      result.current.fetchNextPage();
    });

    await waitFor(() => {
      expect(result.current.hasNextPage).toBe(false);
    });

    expect(mockFetchUserLinks).toHaveBeenCalledTimes(2);
    expect(mockFetchUserLinks).toHaveBeenNthCalledWith(1, {
      collectionId: MOCK_COLLECTION_ID,
      pageSize: 20,
      page: 0,
    });
    expect(mockFetchUserLinks).toHaveBeenNthCalledWith(2, {
      collectionId: MOCK_COLLECTION_ID,
      pageSize: 20,
      page: 1,
    });
    expect(result.current.links).toHaveLength(2);
    expect(result.current.totalCount).toBe(25);
  });
});
