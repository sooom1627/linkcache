import { act, renderHook, waitFor } from "@testing-library/react-native";

import { createMockLink } from "../../__mocks__/linkHelpers";
import { fetchUserLinks } from "../../api/fetchLinks.api";
import { updateLinkStatus } from "../../api/updateLinkStatus.api";
import { useSwipeCards } from "../../hooks/useSwipeCards";
import { clearQueryCache, wrapper } from "../test-utils";

// 外部境界（API関数）のみモック
jest.mock("../../api/fetchLinks.api", () => ({
  fetchUserLinks: jest.fn(),
}));

jest.mock("../../api/updateLinkStatus.api", () => ({
  updateLinkStatus: jest.fn(),
}));

const mockFetchUserLinks = jest.mocked(fetchUserLinks);
const mockUpdateLinkStatus = jest.mocked(updateLinkStatus);

describe("useSwipeCards", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearQueryCache();
  });

  afterEach(() => {
    clearQueryCache();
  });

  describe("データ取得", () => {
    it("inboxのカードデータを取得する", async () => {
      const mockLink1 = createMockLink(1, { status: "inbox" });
      const mockLink2 = createMockLink(2, { status: "inbox" });
      const mockLink3 = createMockLink(3, { status: "inbox" });
      mockFetchUserLinks.mockResolvedValueOnce({
        data: [mockLink1, mockLink2, mockLink3],
        hasMore: false,
        totalCount: 3,
      });

      const { result } = renderHook(
        () => useSwipeCards({ sourceType: "inbox" }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.cards).toHaveLength(3);
      expect(result.current.cards[0]).toEqual(mockLink1);
      expect(result.current.error).toBeNull();
    });

    it("laterのカードデータを取得する", async () => {
      const mockLink1 = createMockLink(1, { status: "later" });
      mockFetchUserLinks.mockResolvedValueOnce({
        data: [mockLink1],
        hasMore: false,
        totalCount: 1,
      });

      const { result } = renderHook(
        () => useSwipeCards({ sourceType: "later" }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.cards).toHaveLength(1);
      expect(mockFetchUserLinks).toHaveBeenCalledWith(
        expect.objectContaining({ status: "later" }),
      );
    });

    it("read_soonのカードデータを取得し、triaged_at_ascでソートする", async () => {
      const mockLink1 = createMockLink(1, { status: "read_soon" });
      const mockLink2 = createMockLink(2, { status: "read_soon" });
      mockFetchUserLinks.mockResolvedValueOnce({
        data: [mockLink1, mockLink2],
        hasMore: false,
        totalCount: 2,
      });

      const { result } = renderHook(
        () => useSwipeCards({ sourceType: "read_soon" }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.cards).toHaveLength(2);
      expect(mockFetchUserLinks).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "read_soon",
          orderBy: "triaged_at_asc",
        }),
      );
    });

    it("デフォルトでinboxを取得する", async () => {
      mockFetchUserLinks.mockResolvedValueOnce({
        data: [],
        hasMore: false,
        totalCount: 0,
      });

      renderHook(() => useSwipeCards(), { wrapper });

      await waitFor(() => {
        expect(mockFetchUserLinks).toHaveBeenCalledWith(
          expect.objectContaining({ status: "inbox" }),
        );
      });
    });
  });

  describe("swipes配列管理", () => {
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
      mockFetchUserLinks.mockResolvedValueOnce({
        data: [mockLink, createMockLink(2)],
        hasMore: false,
        totalCount: 2,
      });
      mockUpdateLinkStatus.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useSwipeCards(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleSwipe(mockLink, "right");
      });

      // invalidateQueriesの完了を待つ
      await waitFor(() => {
        expect(result.current.swipes).toEqual(["right"]);
      });
    });
  });

  describe("handleSwipe", () => {
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

      act(() => {
        result.current.handleSwipe(mockLink, "right");
      });

      await waitFor(() => {
        expect(mockUpdateLinkStatus).toHaveBeenCalledWith(
          mockLink.link_id,
          "read_soon",
        );
      });
    });

    it("左スワイプでupdateLinkStatusをlaterで呼び出す", async () => {
      const mockLink = createMockLink(1, { status: "inbox" });
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

      act(() => {
        result.current.handleSwipe(mockLink, "left");
      });

      await waitFor(() => {
        expect(mockUpdateLinkStatus).toHaveBeenCalledWith(
          mockLink.link_id,
          "later",
        );
      });

      // invalidateQueriesの完了を待つ
      await waitFor(() => {
        expect(result.current.swipes).toEqual(["left"]);
      });
    });
  });

  describe("Undo機能", () => {
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

      act(() => {
        result.current.handleSwipe(mockLink, "right");
      });

      expect(result.current.canUndo).toBe(true);
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

      // 2回スワイプ
      act(() => {
        result.current.handleSwipe(mockLink1, "right");
      });
      act(() => {
        result.current.handleSwipe(mockLink2, "left");
      });

      expect(result.current.swipes).toEqual(["right", "left"]);

      // Undo
      act(() => {
        result.current.undo();
      });

      await waitFor(() => {
        expect(result.current.swipes).toEqual(["right"]);
      });

      // invalidateQueriesの完了を待つ
      await waitFor(() => {
        expect(result.current.canUndo).toBe(true);
      });
    });

    it("undoでAPIが元のステータスで呼び出される", async () => {
      const mockLink = createMockLink(1, { status: "inbox" });
      mockFetchUserLinks.mockResolvedValue({
        data: [mockLink, createMockLink(2)],
        hasMore: false,
        totalCount: 2,
      });
      mockUpdateLinkStatus.mockResolvedValue(undefined);

      const { result } = renderHook(
        () => useSwipeCards({ sourceType: "inbox" }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // 右スワイプ（read_soonに更新）
      act(() => {
        result.current.handleSwipe(mockLink, "right");
      });

      await waitFor(() => {
        expect(mockUpdateLinkStatus).toHaveBeenCalledWith(
          mockLink.link_id,
          "read_soon",
        );
      });

      // Undo（inboxに戻す）
      act(() => {
        result.current.undo();
      });

      await waitFor(() => {
        expect(mockUpdateLinkStatus).toHaveBeenLastCalledWith(
          mockLink.link_id,
          "inbox",
        );
      });

      // invalidateQueriesの完了を待つ
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

      act(() => {
        result.current.handleSwipe(mockLink, "right");
      });

      expect(result.current.canUndo).toBe(true);

      act(() => {
        result.current.undo();
      });

      await waitFor(() => {
        expect(result.current.canUndo).toBe(false);
      });

      // invalidateQueriesの完了を待つ
      await waitFor(() => {
        expect(result.current.swipes).toEqual([]);
      });
    });

    it("laterソースからのundoはlaterに戻す", async () => {
      const mockLink = createMockLink(1, { status: "later" });
      mockFetchUserLinks.mockResolvedValue({
        data: [mockLink],
        hasMore: false,
        totalCount: 1,
      });
      mockUpdateLinkStatus.mockResolvedValue(undefined);

      const { result } = renderHook(
        () => useSwipeCards({ sourceType: "later" }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleSwipe(mockLink, "right");
      });

      await waitFor(() => {
        expect(mockUpdateLinkStatus).toHaveBeenCalledWith(
          mockLink.link_id,
          "read_soon",
        );
      });

      act(() => {
        result.current.undo();
      });

      await waitFor(() => {
        expect(mockUpdateLinkStatus).toHaveBeenLastCalledWith(
          mockLink.link_id,
          "later",
        );
      });

      // invalidateQueriesの完了を待つ
      await waitFor(() => {
        expect(result.current.swipes).toEqual([]);
      });
    });
  });
});
