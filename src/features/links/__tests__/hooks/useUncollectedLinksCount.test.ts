import { renderHook, waitFor } from "@testing-library/react-native";

import { fetchUserLinks } from "../../api/fetchLinks.api";
import { linkQueryKeys } from "../../constants/queryKeys";
import { useUncollectedLinksCount } from "../../hooks/useUncollectedLinksCount";
import { clearQueryCache, testQueryClient, wrapper } from "../test-utils";

jest.mock("../../api/fetchLinks.api", () => ({
  fetchUserLinks: jest.fn(),
}));

const mockFetchUserLinks = jest.mocked(fetchUserLinks);

describe("useUncollectedLinksCount", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearQueryCache();
  });

  afterEach(() => {
    clearQueryCache();
  });

  it("uncollected件数だけを取得して返す", async () => {
    mockFetchUserLinks.mockResolvedValueOnce({
      data: [],
      hasMore: false,
      totalCount: 7,
    });

    const { result } = renderHook(() => useUncollectedLinksCount(), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetchUserLinks).toHaveBeenCalledWith({
      uncollectedOnly: true,
      pageSize: 1,
    });
    expect(result.current.count).toBe(7);

    const queries = testQueryClient.getQueryCache().findAll({
      queryKey: linkQueryKeys.uncollectedCount(),
    });
    expect(queries).toHaveLength(1);
  });

  it("エラー時にisErrorとerrorを返す", async () => {
    const mockError = new Error("API Error");
    mockFetchUserLinks.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useUncollectedLinksCount(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(mockError);
    expect(result.current.count).toBe(0);
  });
});
