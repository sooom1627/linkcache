import { act, renderHook, waitFor } from "@testing-library/react-native";

import { createMockLink } from "../../__mocks__/linkHelpers";
import { fetchUserLinks } from "../../api/fetchLinks.api";
import { linkQueryKeys } from "../../constants/queryKeys";
import { useUncollectedLinks } from "../../hooks/useUncollectedLinks";
import { clearQueryCache, testQueryClient, wrapper } from "../test-utils";

jest.mock("../../api/fetchLinks.api", () => ({
  fetchUserLinks: jest.fn(),
}));

const mockFetchUserLinks = jest.mocked(fetchUserLinks);

describe("useUncollectedLinks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearQueryCache();
  });

  afterEach(() => {
    clearQueryCache();
  });

  it("初回取得でuncollectedOnly=trueを渡してリンク一覧を取得する", async () => {
    mockFetchUserLinks.mockResolvedValueOnce({
      data: [
        createMockLink(1, { status: "new" }),
        createMockLink(2, { status: "stock" }),
      ],
      hasMore: false,
      totalCount: 2,
    });

    const { result } = renderHook(() => useUncollectedLinks(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetchUserLinks).toHaveBeenCalledWith({
      uncollectedOnly: true,
      pageSize: 20,
      page: 0,
      status: undefined,
      isRead: undefined,
    });
    expect(result.current.links).toHaveLength(2);
    expect(result.current.totalCount).toBe(2);
  });

  it("filterParamsを指定するとquery keyとfetch引数に反映される", async () => {
    const filterParams = { status: "done" as const, isRead: true };
    mockFetchUserLinks.mockResolvedValueOnce({
      data: [],
      hasMore: false,
      totalCount: 0,
    });

    const { result } = renderHook(() => useUncollectedLinks(filterParams), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetchUserLinks).toHaveBeenCalledWith({
      uncollectedOnly: true,
      pageSize: 20,
      page: 0,
      status: "done",
      isRead: true,
    });

    const queries = testQueryClient.getQueryCache().findAll({
      queryKey: linkQueryKeys.uncollectedList(filterParams),
    });
    expect(queries).toHaveLength(1);
  });

  it("hasMoreがtrueのときfetchNextPageで次ページを取得する", async () => {
    mockFetchUserLinks
      .mockResolvedValueOnce({
        data: [createMockLink(1)],
        hasMore: true,
        totalCount: 25,
      })
      .mockResolvedValueOnce({
        data: [createMockLink(2)],
        hasMore: false,
        totalCount: 25,
      });

    const { result } = renderHook(() => useUncollectedLinks(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.fetchNextPage();
    });

    await waitFor(() => {
      expect(result.current.hasNextPage).toBe(false);
    });

    expect(mockFetchUserLinks).toHaveBeenNthCalledWith(1, {
      uncollectedOnly: true,
      pageSize: 20,
      page: 0,
      status: undefined,
      isRead: undefined,
    });
    expect(mockFetchUserLinks).toHaveBeenNthCalledWith(2, {
      uncollectedOnly: true,
      pageSize: 20,
      page: 1,
      status: undefined,
      isRead: undefined,
    });
    expect(result.current.links).toHaveLength(2);
  });

  it("エラー時にisErrorとerrorを返す", async () => {
    const mockError = new Error("API Error");
    mockFetchUserLinks.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useUncollectedLinks(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(mockError);
    expect(result.current.links).toEqual([]);
  });
});
