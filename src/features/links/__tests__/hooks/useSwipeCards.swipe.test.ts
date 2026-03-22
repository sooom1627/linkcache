import { act, renderHook, waitFor } from "@testing-library/react-native";

import { createMockLink } from "../../__mocks__/linkHelpers";
import { fetchUserLinks } from "../../api/fetchLinks.api";
import { updateLinkStatus } from "../../api/updateLinkStatus.api";
import { linkQueryKeys } from "../../constants/queryKeys";
import { useSwipeCards } from "../../hooks/useSwipeCards";
import { clearQueryCache, testQueryClient, wrapper } from "../test-utils";

jest.mock("../../api/fetchLinks.api", () => ({
  fetchUserLinks: jest.fn(),
}));

jest.mock("../../api/updateLinkStatus.api", () => ({
  updateLinkStatus: jest.fn(),
}));

const mockFetchUserLinks = jest.mocked(fetchUserLinks);
const mockUpdateLinkStatus = jest.mocked(updateLinkStatus);

describe("useSwipeCards - swipes配列管理", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearQueryCache();
  });

  afterEach(() => {
    clearQueryCache();
  });

  it("初期状態ではswipesは空配列", async () => {
    mockFetchUserLinks.mockResolvedValueOnce({
      data: [createMockLink(1)],
      hasMore: false,
      totalCount: 1,
    });

    const { result } = renderHook(() => useSwipeCards(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.swipes).toEqual([]);
  });

  it("handleSwipeでswipes配列に方向が追加される", async () => {
    const mockLink = createMockLink(1);
    mockFetchUserLinks.mockResolvedValue({
      data: [mockLink, createMockLink(2)],
      hasMore: false,
      totalCount: 2,
    });
    mockUpdateLinkStatus.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useSwipeCards(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      result.current.handleSwipe(mockLink, "right");
    });

    await waitFor(() => {
      expect(result.current.swipes).toEqual(["right"]);
    });
  });
});

describe("useSwipeCards - handleSwipe", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearQueryCache();
  });

  afterEach(() => {
    clearQueryCache();
  });

  it("右スワイプでupdateLinkStatusをread_soonで呼び出す", async () => {
    const mockLink = createMockLink(1);
    mockFetchUserLinks.mockResolvedValue({
      data: [mockLink, createMockLink(2)],
      hasMore: false,
      totalCount: 2,
    });
    mockUpdateLinkStatus.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useSwipeCards(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      result.current.handleSwipe(mockLink, "right");
    });

    await waitFor(() => {
      expect(mockUpdateLinkStatus).toHaveBeenCalledWith(
        mockLink.link_id,
        "read_soon",
      );
    });
  });

  it("左スワイプでupdateLinkStatusをstockで呼び出す", async () => {
    const mockLink = createMockLink(1, { status: "new" });
    mockFetchUserLinks.mockResolvedValue({
      data: [mockLink, createMockLink(2)],
      hasMore: false,
      totalCount: 2,
    });
    mockUpdateLinkStatus.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useSwipeCards(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      result.current.handleSwipe(mockLink, "left");
    });

    await waitFor(() => {
      expect(mockUpdateLinkStatus).toHaveBeenCalledWith(
        mockLink.link_id,
        "stock",
      );
    });

    await waitFor(() => {
      expect(result.current.swipes).toEqual(["left"]);
    });
  });
});

describe("useSwipeCards - cache invalidation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearQueryCache();
  });

  afterEach(() => {
    clearQueryCache();
  });

  it("スワイプ成功時に dashboard 概要クエリのプレフィックスを invalidate する", async () => {
    const mockLink = createMockLink(1);
    mockFetchUserLinks.mockResolvedValue({
      data: [mockLink, createMockLink(2)],
      hasMore: false,
      totalCount: 2,
    });
    mockUpdateLinkStatus.mockResolvedValueOnce(undefined);

    const invalidateSpy = jest.spyOn(testQueryClient, "invalidateQueries");

    const { result } = renderHook(() => useSwipeCards(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      result.current.handleSwipe(mockLink, "right");
    });

    await waitFor(() => {
      expect(mockUpdateLinkStatus).toHaveBeenCalled();
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: linkQueryKeys.dashboardOverviewPrefix(),
    });

    invalidateSpy.mockRestore();
  });
});
