import { act, renderHook, waitFor } from "@testing-library/react-native";

import { updateLinkStatus } from "../../api/updateLinkStatus.api";
import { linkQueryKeys } from "../../constants/queryKeys";
import type { UseLinksReturn } from "../../hooks/useLinks";
import { useSwipeTriage } from "../../hooks/useSwipeTriage";
import { clearQueryCache, testQueryClient, wrapper } from "../test-utils";

// API層のモック
jest.mock("../../api/updateLinkStatus.api", () => ({
  updateLinkStatus: jest.fn(),
}));

// useLinksフックのモック
jest.mock("../../hooks/useLinks", () => ({
  useLinks: jest.fn(),
}));

const mockUpdateLinkStatus = jest.mocked(updateLinkStatus);
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const useLinksModule = require("../../hooks/useLinks");
const mockUseLinks = jest.mocked(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  useLinksModule.useLinks,
) as jest.MockedFunction<() => UseLinksReturn>;

// モックデータ
const createMockLink = (id: number) => ({
  status_id: `status-${id}`,
  user_id: "user-1",
  status: "inbox" as const,
  triaged_at: null,
  read_at: null,
  saved_at: `2024-01-0${id}T00:00:00Z`,
  link_id: `link-${id}`,
  url: `https://example${id}.com`,
  title: `Example ${id}`,
  description: `Description ${id}`,
  image_url: null,
  favicon_url: null,
  site_name: `Site ${id}`,
  link_created_at: `2024-01-0${id}T00:00:00Z`,
});

describe("useSwipeTriage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearQueryCache();
  });

  afterEach(() => {
    clearQueryCache();
    // アクティブなタイマーをクリア
    jest.clearAllTimers();
  });

  afterAll(() => {
    // テスト終了時にQueryClientを完全にクリーンアップ
    clearQueryCache();
  });

  it("returns current link from inbox", () => {
    const mockLink = createMockLink(1);
    mockUseLinks.mockReturnValue({
      links: [mockLink],
      isLoading: false,
      error: null,
      isFetchingNextPage: false,
      isError: false,
      hasNextPage: false,
      totalCount: 1,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
      isRefreshing: false,
    });

    const { result } = renderHook(() => useSwipeTriage(), { wrapper });

    expect(result.current.currentLink).toEqual(mockLink);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("returns null when inbox is empty", () => {
    mockUseLinks.mockReturnValue({
      links: [],
      isLoading: false,
      error: null,
      isFetchingNextPage: false,
      isError: false,
      hasNextPage: false,
      totalCount: 0,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
      isRefreshing: false,
    });

    const { result } = renderHook(() => useSwipeTriage(), { wrapper });

    expect(result.current.currentLink).toBeNull();
  });

  it("returns loading state when useLinks is loading", () => {
    mockUseLinks.mockReturnValue({
      links: [],
      isLoading: true,
      error: null,
      isFetchingNextPage: false,
      isError: false,
      hasNextPage: false,
      totalCount: 0,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
      isRefreshing: false,
    });

    const { result } = renderHook(() => useSwipeTriage(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it("returns error state when useLinks has error", () => {
    const mockError = new Error("Failed to fetch links");
    mockUseLinks.mockReturnValue({
      links: [],
      isLoading: false,
      error: mockError,
      isFetchingNextPage: false,
      isError: true,
      hasNextPage: false,
      totalCount: 0,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
      isRefreshing: false,
    });

    const { result } = renderHook(() => useSwipeTriage(), { wrapper });

    expect(result.current.error).toBe(mockError);
  });

  it("calls updateLinkStatus with read_soon when handleSwipeRight is called", async () => {
    const mockLink = createMockLink(1);
    mockUseLinks.mockReturnValue({
      links: [mockLink],
      isLoading: false,
      error: null,
      isFetchingNextPage: false,
      isError: false,
      hasNextPage: false,
      totalCount: 1,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
      isRefreshing: false,
    });
    mockUpdateLinkStatus.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useSwipeTriage(), { wrapper });

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

  it("calls updateLinkStatus with later when handleSwipeLeft is called", async () => {
    const mockLink = createMockLink(1);
    mockUseLinks.mockReturnValue({
      links: [mockLink],
      isLoading: false,
      error: null,
      isFetchingNextPage: false,
      isError: false,
      hasNextPage: false,
      totalCount: 1,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
      isRefreshing: false,
    });
    mockUpdateLinkStatus.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useSwipeTriage(), { wrapper });

    act(() => {
      result.current.handleSwipeLeft(mockLink.link_id);
    });

    await waitFor(() => {
      expect(result.current.isUpdating).toBe(false);
    });

    expect(mockUpdateLinkStatus).toHaveBeenCalledWith(
      mockLink.link_id,
      "later",
    );
  });

  it("shows updating state during mutation", async () => {
    const mockLink = createMockLink(1);
    mockUseLinks.mockReturnValue({
      links: [mockLink],
      isLoading: false,
      error: null,
      isFetchingNextPage: false,
      isError: false,
      hasNextPage: false,
      totalCount: 1,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
      isRefreshing: false,
    });

    let resolveUpdate: (value: unknown) => void;
    const delayedUpdate = new Promise((resolve) => {
      resolveUpdate = resolve;
    });

    mockUpdateLinkStatus.mockReturnValueOnce(delayedUpdate as Promise<void>);

    const { result } = renderHook(() => useSwipeTriage(), { wrapper });

    act(() => {
      result.current.handleSwipeRight(mockLink.link_id);
    });

    await waitFor(() => {
      expect(result.current.isUpdating).toBe(true);
    });

    await act(async () => {
      resolveUpdate!(undefined);
    });

    await waitFor(() => {
      expect(result.current.isUpdating).toBe(false);
    });
  });

  it("invalidates link list cache on successful update", async () => {
    const mockLink = createMockLink(1);
    mockUseLinks.mockReturnValue({
      links: [mockLink],
      isLoading: false,
      error: null,
      isFetchingNextPage: false,
      isError: false,
      hasNextPage: false,
      totalCount: 1,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
      isRefreshing: false,
    });
    mockUpdateLinkStatus.mockResolvedValueOnce(undefined);

    const invalidateQueriesSpy = jest.spyOn(
      testQueryClient,
      "invalidateQueries",
    );

    const { result } = renderHook(() => useSwipeTriage(), { wrapper });

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
