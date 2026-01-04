import {
  renderHook,
  waitFor,
  type RenderHookResult,
} from "@testing-library/react-native";

import { fetchUserLinks } from "../../api/fetchLinks.api";
import { useLinks, type UseLinksReturn } from "../../hooks/useLinks";
import { clearQueryCache, wrapper } from "../test-utils";

// API関数をモック
jest.mock("../../api/fetchLinks.api", () => ({
  fetchUserLinks: jest.fn(),
}));

const mockFetchUserLinks = jest.mocked(fetchUserLinks);

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

describe("useLinks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearQueryCache();
  });

  describe("初期データ取得", () => {
    it("マウント時にリンク一覧を取得する", async () => {
      const mockData = {
        data: [createMockLink(1), createMockLink(2)],
        hasMore: false,
        totalCount: 2,
      };
      mockFetchUserLinks.mockResolvedValueOnce(mockData);

      const { result } = renderHook(() => useLinks(), {
        wrapper,
      }) as RenderHookResult<UseLinksReturn, void>;

      // 初期状態はローディング
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.links).toHaveLength(2);
      expect(result.current.links[0].title).toBe("Example 1");
      expect(result.current.hasNextPage).toBe(false);
      expect(result.current.totalCount).toBe(2);
    });

    it("空のデータを正しく処理する", async () => {
      mockFetchUserLinks.mockResolvedValueOnce({
        data: [],
        hasMore: false,
        totalCount: 0,
      });

      const { result } = renderHook(() => useLinks(), {
        wrapper,
      }) as RenderHookResult<UseLinksReturn, void>;

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.links).toEqual([]);
      expect(result.current.hasNextPage).toBe(false);
      expect(result.current.totalCount).toBe(0);
    });
  });

  describe("ページング", () => {
    it("次のページを取得できる", async () => {
      // 1ページ目
      mockFetchUserLinks.mockResolvedValueOnce({
        data: [createMockLink(1), createMockLink(2)],
        hasMore: true,
        totalCount: 4,
      });

      const { result } = renderHook(() => useLinks(), {
        wrapper,
      }) as RenderHookResult<UseLinksReturn, void>;

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasNextPage).toBe(true);
      expect(result.current.links).toHaveLength(2);

      // 2ページ目
      mockFetchUserLinks.mockResolvedValueOnce({
        data: [createMockLink(3), createMockLink(4)],
        hasMore: false,
        totalCount: 4,
      });

      result.current.fetchNextPage();

      // 次ページ取得が完了し、データが4件になるまで待つ
      await waitFor(() => {
        expect(result.current.links).toHaveLength(4);
      });

      expect(result.current.hasNextPage).toBe(false);
    });
  });

  describe("エラーハンドリング", () => {
    it("エラー発生時にerrorを返す", async () => {
      const mockError = new Error("Failed to fetch");
      mockFetchUserLinks.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useLinks(), {
        wrapper,
      }) as RenderHookResult<UseLinksReturn, void>;

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBeDefined();
    });
  });

  describe("リフレッシュ", () => {
    it("refetchでデータを再取得できる", async () => {
      mockFetchUserLinks.mockResolvedValueOnce({
        data: [createMockLink(1)],
        hasMore: false,
        totalCount: 1,
      });

      const { result } = renderHook(() => useLinks(), {
        wrapper,
      }) as RenderHookResult<UseLinksReturn, void>;

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.links).toHaveLength(1);

      // リフレッシュ（新しいデータ）
      mockFetchUserLinks.mockResolvedValueOnce({
        data: [createMockLink(1), createMockLink(2)],
        hasMore: false,
        totalCount: 2,
      });

      result.current.refetch();

      await waitFor(() => {
        expect(result.current.links).toHaveLength(2);
      });
    });
  });

  describe("フィルタリング", () => {
    it("statusを指定してフィルタリングできる", async () => {
      const readSoonLink = {
        ...createMockLink(1),
        status: "read_soon" as const,
      };
      mockFetchUserLinks.mockResolvedValueOnce({
        data: [readSoonLink],
        hasMore: false,
        totalCount: 1,
      });

      const { result } = renderHook(() => useLinks({ status: "read_soon" }), {
        wrapper,
      }) as RenderHookResult<UseLinksReturn, void>;

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetchUserLinks).toHaveBeenCalledWith(
        expect.objectContaining({ status: "read_soon" }),
      );
      expect(result.current.links).toHaveLength(1);
    });

    it("limitを指定すると無限スクロールが無効になる", async () => {
      mockFetchUserLinks.mockResolvedValueOnce({
        data: [createMockLink(1), createMockLink(2)],
        hasMore: false,
        totalCount: 10,
      });

      const { result } = renderHook(() => useLinks({ limit: 5 }), {
        wrapper,
      }) as RenderHookResult<UseLinksReturn, void>;

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetchUserLinks).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 5 }),
      );
      // limit指定時はhasNextPageは常にfalse
      expect(result.current.hasNextPage).toBe(false);
    });

    it("statusとlimitを組み合わせて使用できる", async () => {
      const readSoonLink = {
        ...createMockLink(1),
        status: "read_soon" as const,
      };
      mockFetchUserLinks.mockResolvedValueOnce({
        data: [readSoonLink],
        hasMore: false,
        totalCount: 5,
      });

      const { result } = renderHook(
        () => useLinks({ status: "read_soon", limit: 5 }),
        { wrapper },
      ) as RenderHookResult<UseLinksReturn, void>;

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetchUserLinks).toHaveBeenCalledWith(
        expect.objectContaining({ status: "read_soon", limit: 5 }),
      );
    });
  });
});
