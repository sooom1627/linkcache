import { act, renderHook, waitFor } from "@testing-library/react-native";

import { createMockLink } from "../../__mocks__/linkHelpers";
import { fetchUserLinks } from "../../api/fetchLinks.api";
import { updateLinkStatus } from "../../api/updateLinkStatus.api";
import { useSwipeCards } from "../../hooks/useSwipeCards";
import { clearQueryCache, wrapper } from "../test-utils";

jest.mock("../../api/fetchLinks.api", () => ({
  fetchUserLinks: jest.fn(),
}));

jest.mock("../../api/updateLinkStatus.api", () => ({
  updateLinkStatus: jest.fn(),
}));

const mockFetchUserLinks = jest.mocked(fetchUserLinks);
const mockUpdateLinkStatus = jest.mocked(updateLinkStatus);

describe("useSwipeCards - Undo機能", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearQueryCache();
  });

  afterEach(() => {
    clearQueryCache();
  });

  it("canUndoはスワイプ後にtrueになる", async () => {
    const mockLink = createMockLink(1);
    mockFetchUserLinks.mockResolvedValue({
      data: [mockLink, createMockLink(2)],
      hasMore: false,
      totalCount: 2,
    });
    mockUpdateLinkStatus.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSwipeCards(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.canUndo).toBe(false);

    await act(async () => {
      result.current.handleSwipe(mockLink, "right");
    });

    await waitFor(() => {
      expect(result.current.canUndo).toBe(true);
    });
  });

  it("undoでswipes配列から最後の要素が削除される", async () => {
    const mockLink1 = createMockLink(1);
    const mockLink2 = createMockLink(2);
    mockFetchUserLinks.mockResolvedValue({
      data: [mockLink1, mockLink2, createMockLink(3)],
      hasMore: false,
      totalCount: 3,
    });
    mockUpdateLinkStatus.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSwipeCards(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      result.current.handleSwipe(mockLink1, "right");
    });
    await act(async () => {
      result.current.handleSwipe(mockLink2, "left");
    });

    await waitFor(() => {
      expect(result.current.swipes).toEqual(["right", "left"]);
    });

    await act(async () => {
      result.current.undo();
    });

    await waitFor(() => {
      expect(result.current.swipes).toEqual(["right"]);
    });

    await waitFor(() => {
      expect(result.current.canUndo).toBe(true);
    });
  });

  it("undoでAPIが元のステータスで呼び出される", async () => {
    const mockLink = createMockLink(1, { status: "new" });
    mockFetchUserLinks.mockResolvedValue({
      data: [mockLink, createMockLink(2)],
      hasMore: false,
      totalCount: 2,
    });
    mockUpdateLinkStatus.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSwipeCards({ sourceType: "new" }), {
      wrapper,
    });

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

    await act(async () => {
      result.current.undo();
    });

    await waitFor(() => {
      expect(mockUpdateLinkStatus).toHaveBeenLastCalledWith(
        mockLink.link_id,
        "new",
      );
    });

    await waitFor(() => {
      expect(result.current.swipes).toEqual([]);
    });
  });

  it("undo後はcanUndoがfalseになる（履歴が空の場合）", async () => {
    const mockLink = createMockLink(1);
    mockFetchUserLinks.mockResolvedValue({
      data: [mockLink, createMockLink(2)],
      hasMore: false,
      totalCount: 2,
    });
    mockUpdateLinkStatus.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSwipeCards(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      result.current.handleSwipe(mockLink, "right");
    });

    await waitFor(() => {
      expect(result.current.canUndo).toBe(true);
    });

    await act(async () => {
      result.current.undo();
    });

    await waitFor(() => {
      expect(result.current.canUndo).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.swipes).toEqual([]);
    });
  });

  it("stockソースからのundoはstockに戻す", async () => {
    const mockLink = createMockLink(1, { status: "stock" });
    mockFetchUserLinks.mockResolvedValue({
      data: [mockLink],
      hasMore: false,
      totalCount: 1,
    });
    mockUpdateLinkStatus.mockResolvedValue(undefined);

    const { result } = renderHook(
      () => useSwipeCards({ sourceType: "stock" }),
      { wrapper },
    );

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

    await act(async () => {
      result.current.undo();
    });

    await waitFor(() => {
      expect(mockUpdateLinkStatus).toHaveBeenLastCalledWith(
        mockLink.link_id,
        "stock",
      );
    });

    await waitFor(() => {
      expect(result.current.swipes).toEqual([]);
    });
  });
});
