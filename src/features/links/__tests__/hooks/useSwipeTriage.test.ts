import { act, renderHook, waitFor } from "@testing-library/react-native";

import { createMockLink } from "../../__mocks__/linkHelpers";
import { fetchUserLinks } from "../../api/fetchLinks.api";
import { updateLinkStatus } from "../../api/updateLinkStatus.api";
import { linkQueryKeys } from "../../constants/queryKeys";
import { useSwipeTriage } from "../../hooks/useSwipeTriage";
import { clearQueryCache, testQueryClient, wrapper } from "../test-utils";

// 外部境界（API関数）のみモック
jest.mock("../../api/fetchLinks.api", () => ({
  fetchUserLinks: jest.fn(),
}));

jest.mock("../../api/updateLinkStatus.api", () => ({
  updateLinkStatus: jest.fn(),
}));

const mockFetchUserLinks = jest.mocked(fetchUserLinks);
const mockUpdateLinkStatus = jest.mocked(updateLinkStatus);

describe("useSwipeTriage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearQueryCache();
  });

  afterEach(() => {
    clearQueryCache();
  });

  it("returns current link and card stack from inbox", async () => {
    const mockLink1 = createMockLink(1);
    const mockLink2 = createMockLink(2);
    const mockLink3 = createMockLink(3);
    mockFetchUserLinks.mockResolvedValueOnce({
      data: [mockLink1, mockLink2, mockLink3],
      hasMore: false,
      totalCount: 3,
    });

    const { result } = renderHook(() => useSwipeTriage(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.currentLink).toEqual(mockLink1);
    expect(result.current.nextLink).toEqual(mockLink2);
    expect(result.current.queuedLink).toEqual(mockLink3);
    expect(result.current.cardStack).toHaveLength(3);
    expect(result.current.error).toBeNull();
    expect(mockFetchUserLinks).toHaveBeenCalledWith(
      expect.objectContaining({ status: "inbox", limit: 3 }),
    );
  });

  it("calls updateLinkStatus with read_soon when handleSwipeRight is called", async () => {
    const mockLink = createMockLink(1);
    mockFetchUserLinks.mockResolvedValueOnce({
      data: [mockLink, createMockLink(2), createMockLink(3)],
      hasMore: false,
      totalCount: 3,
    });
    mockUpdateLinkStatus.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useSwipeTriage(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.handleSwipeRight(mockLink.link_id);
    });

    await waitFor(() => {
      expect(result.current.isUpdating).toBe(false);
    });

    expect(mockUpdateLinkStatus).toHaveBeenCalledWith(
      mockLink.link_id,
      "read_soon",
    );
  });

  it("invalidates link list cache on successful update", async () => {
    const mockLink = createMockLink(1);
    mockFetchUserLinks.mockResolvedValueOnce({
      data: [mockLink, createMockLink(2), createMockLink(3)],
      hasMore: false,
      totalCount: 3,
    });
    mockUpdateLinkStatus.mockResolvedValueOnce(undefined);

    const invalidateQueriesSpy = jest.spyOn(
      testQueryClient,
      "invalidateQueries",
    );

    const { result } = renderHook(() => useSwipeTriage(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.handleSwipeRight(mockLink.link_id);
    });

    await waitFor(() => {
      expect(result.current.isUpdating).toBe(false);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: linkQueryKeys.list(),
    });

    invalidateQueriesSpy.mockRestore();
  });
});
