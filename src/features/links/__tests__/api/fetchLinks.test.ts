import { supabase } from "@/src/shared/lib/supabase";

import { fetchUserLinks } from "../../api/fetchLinks.api";

// Supabase クライアントをモック
jest.mock("@/src/shared/lib/supabase", () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

const mockRpc = supabase.rpc as jest.Mock;

describe("fetchUserLinks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("正常系", () => {
    it("デフォルトパラメータでリンク一覧を取得できる", async () => {
      const mockResponse = {
        data: {
          data: [
            {
              status_id: "550e8400-e29b-41d4-a716-446655440000",
              user_id: "550e8400-e29b-41d4-a716-446655440001",
              status: "new",
              triaged_at: null,
              read_at: null,
              link_id: "550e8400-e29b-41d4-a716-446655440002",
              url: "https://example.com",
              title: "Example",
              image_url: null,
              favicon_url: null,
              site_name: "Example Site",
              link_created_at: "2024-01-01T00:00:00Z",
            },
          ],
          hasMore: false,
          totalCount: 1,
        },
        error: null,
      };

      mockRpc.mockResolvedValueOnce(mockResponse);

      const result = await fetchUserLinks();

      expect(mockRpc).toHaveBeenCalledWith("get_user_links", {
        p_page_size: 20,
        p_page: 0,
        p_status: null,
        p_is_read: null,
        p_limit: null,
        p_order_by: null,
        p_collection_id: null,
        p_uncollected_only: false,
      });
      expect(result.data).toHaveLength(1);
      expect(result.hasMore).toBe(false);
      expect(result.totalCount).toBe(1);
    });

    it("カスタムページサイズとページ番号で取得できる", async () => {
      const mockResponse = {
        data: {
          data: [],
          hasMore: true,
          totalCount: 50,
        },
        error: null,
      };

      mockRpc.mockResolvedValueOnce(mockResponse);

      const result = await fetchUserLinks({ pageSize: 10, page: 2 });

      expect(mockRpc).toHaveBeenCalledWith("get_user_links", {
        p_page_size: 10,
        p_page: 2,
        p_status: null,
        p_is_read: null,
        p_limit: null,
        p_order_by: null,
        p_collection_id: null,
        p_uncollected_only: false,
      });
      expect(result.hasMore).toBe(true);
      expect(result.totalCount).toBe(50);
    });

    it("statusフィルタを指定して取得できる", async () => {
      const mockResponse = {
        data: {
          data: [],
          hasMore: false,
          totalCount: 5,
        },
        error: null,
      };

      mockRpc.mockResolvedValueOnce(mockResponse);

      const result = await fetchUserLinks({ status: "read_soon" });

      expect(mockRpc).toHaveBeenCalledWith("get_user_links", {
        p_page_size: 20,
        p_page: 0,
        p_status: "read_soon",
        p_is_read: null,
        p_limit: null,
        p_order_by: null,
        p_collection_id: null,
        p_uncollected_only: false,
      });
      expect(result.totalCount).toBe(5);
    });

    it("isReadフィルタを指定して取得できる", async () => {
      const mockResponse = {
        data: {
          data: [],
          hasMore: false,
          totalCount: 3,
        },
        error: null,
      };

      mockRpc.mockResolvedValueOnce(mockResponse);

      const result = await fetchUserLinks({ isRead: false });

      expect(mockRpc).toHaveBeenCalledWith("get_user_links", {
        p_page_size: 20,
        p_page: 0,
        p_status: null,
        p_is_read: false,
        p_limit: null,
        p_order_by: null,
        p_collection_id: null,
        p_uncollected_only: false,
      });
      expect(result.totalCount).toBe(3);
    });

    it("limitを指定して取得できる", async () => {
      const mockResponse = {
        data: {
          data: [],
          hasMore: false,
          totalCount: 10,
        },
        error: null,
      };

      mockRpc.mockResolvedValueOnce(mockResponse);

      const result = await fetchUserLinks({ limit: 5 });

      expect(mockRpc).toHaveBeenCalledWith("get_user_links", {
        p_page_size: 20,
        p_page: 0,
        p_status: null,
        p_is_read: null,
        p_limit: 5,
        p_order_by: null,
        p_collection_id: null,
        p_uncollected_only: false,
      });
      expect(result.hasMore).toBe(false);
    });

    it("複合フィルタを指定して取得できる", async () => {
      const mockResponse = {
        data: {
          data: [],
          hasMore: false,
          totalCount: 2,
        },
        error: null,
      };

      mockRpc.mockResolvedValueOnce(mockResponse);

      const result = await fetchUserLinks({
        status: "read_soon",
        isRead: true,
        limit: 5,
      });

      expect(mockRpc).toHaveBeenCalledWith("get_user_links", {
        p_page_size: 20,
        p_page: 0,
        p_status: "read_soon",
        p_is_read: true,
        p_limit: 5,
        p_order_by: null,
        p_collection_id: null,
        p_uncollected_only: false,
      });
      expect(result.totalCount).toBe(2);
    });

    it("orderByパラメーターを指定して取得できる", async () => {
      const mockResponse = {
        data: {
          data: [],
          hasMore: false,
          totalCount: 3,
        },
        error: null,
      };

      mockRpc.mockResolvedValueOnce(mockResponse);

      const result = await fetchUserLinks({
        status: "stock",
        orderBy: "triaged_at_asc",
      });

      expect(mockRpc).toHaveBeenCalledWith("get_user_links", {
        p_page_size: 20,
        p_page: 0,
        p_status: "stock",
        p_is_read: null,
        p_limit: null,
        p_order_by: "triaged_at_asc",
        p_collection_id: null,
        p_uncollected_only: false,
      });
      expect(result.totalCount).toBe(3);
    });

    it("orderByにcreated_at_descを指定して取得できる", async () => {
      const mockResponse = {
        data: {
          data: [],
          hasMore: false,
          totalCount: 5,
        },
        error: null,
      };

      mockRpc.mockResolvedValueOnce(mockResponse);

      const result = await fetchUserLinks({
        orderBy: "created_at_desc",
      });

      expect(mockRpc).toHaveBeenCalledWith("get_user_links", {
        p_page_size: 20,
        p_page: 0,
        p_status: null,
        p_is_read: null,
        p_limit: null,
        p_order_by: "created_at_desc",
        p_collection_id: null,
        p_uncollected_only: false,
      });
      expect(result.totalCount).toBe(5);
    });

    it("orderByが未指定の場合はデフォルトでnullを渡す", async () => {
      const mockResponse = {
        data: {
          data: [],
          hasMore: false,
          totalCount: 1,
        },
        error: null,
      };

      mockRpc.mockResolvedValueOnce(mockResponse);

      const result = await fetchUserLinks();

      expect(mockRpc).toHaveBeenCalledWith("get_user_links", {
        p_page_size: 20,
        p_page: 0,
        p_status: null,
        p_is_read: null,
        p_limit: null,
        p_order_by: null,
        p_collection_id: null,
        p_uncollected_only: false,
      });
      expect(result.totalCount).toBe(1);
    });

    it("collectionIdを指定してコレクション内リンクを取得できる", async () => {
      const mockResponse = {
        data: {
          data: [
            {
              status_id: "550e8400-e29b-41d4-a716-446655440000",
              user_id: "550e8400-e29b-41d4-a716-446655440001",
              status: "new",
              triaged_at: null,
              read_at: null,
              link_id: "550e8400-e29b-41d4-a716-446655440002",
              url: "https://example.com",
              title: "Example",
              image_url: null,
              favicon_url: null,
              site_name: "Example Site",
              link_created_at: "2024-01-01T00:00:00Z",
            },
          ],
          hasMore: false,
          totalCount: 1,
        },
        error: null,
      };

      mockRpc.mockResolvedValueOnce(mockResponse);

      const collectionId = "550e8400-e29b-41d4-a716-446655440099";
      const result = await fetchUserLinks({ collectionId });

      expect(mockRpc).toHaveBeenCalledWith("get_user_links", {
        p_page_size: 20,
        p_page: 0,
        p_status: null,
        p_is_read: null,
        p_limit: null,
        p_order_by: null,
        p_collection_id: collectionId,
        p_uncollected_only: false,
      });
      expect(result.data).toHaveLength(1);
      expect(result.totalCount).toBe(1);
    });

    it("uncollectedOnlyを指定して未所属リンクを取得できる", async () => {
      const mockResponse = {
        data: {
          data: [
            {
              status_id: "550e8400-e29b-41d4-a716-446655440010",
              user_id: "550e8400-e29b-41d4-a716-446655440011",
              status: "stock",
              triaged_at: "2024-01-02T00:00:00Z",
              read_at: null,
              link_id: "550e8400-e29b-41d4-a716-446655440012",
              url: "https://uncollected.example.com",
              title: "Uncollected",
              image_url: null,
              favicon_url: null,
              site_name: "Example Site",
              link_created_at: "2024-01-01T00:00:00Z",
            },
          ],
          hasMore: false,
          totalCount: 1,
        },
        error: null,
      };

      mockRpc.mockResolvedValueOnce(mockResponse);

      const result = await fetchUserLinks({ uncollectedOnly: true });

      expect(mockRpc).toHaveBeenCalledWith("get_user_links", {
        p_page_size: 20,
        p_page: 0,
        p_status: null,
        p_is_read: null,
        p_limit: null,
        p_order_by: null,
        p_collection_id: null,
        p_uncollected_only: true,
      });
      expect(result.data).toHaveLength(1);
      expect(result.totalCount).toBe(1);
    });

    it("空のデータを正しく処理できる", async () => {
      const mockResponse = {
        data: {
          data: [],
          hasMore: false,
          totalCount: 0,
        },
        error: null,
      };

      mockRpc.mockResolvedValueOnce(mockResponse);

      const result = await fetchUserLinks();

      expect(result.data).toEqual([]);
      expect(result.hasMore).toBe(false);
      expect(result.totalCount).toBe(0);
    });
  });

  describe("異常系", () => {
    it("Supabaseエラーが発生した場合はエラーをスローする", async () => {
      const mockError = { message: "Database error", code: "500" };
      mockRpc.mockResolvedValueOnce({ data: null, error: mockError });

      await expect(fetchUserLinks()).rejects.toEqual(mockError);
    });

    it("データがnullの場合はエラーをスローする", async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: null });

      await expect(fetchUserLinks()).rejects.toThrow(
        "No data returned from RPC",
      );
    });

    it("不正なレスポンス形式の場合はエラーをスローする", async () => {
      const invalidResponse = {
        data: {
          data: "invalid", // 配列ではない
          hasMore: false,
          totalCount: 0,
        },
        error: null,
      };

      mockRpc.mockResolvedValueOnce(invalidResponse);

      await expect(fetchUserLinks()).rejects.toThrow(
        "Invalid RPC response format",
      );
    });

    it("無効なorderBy値の場合はエラーをスローする", async () => {
      await expect(
        fetchUserLinks({ orderBy: "invalid_order_by" }),
      ).rejects.toThrow();
    });

    it("collectionIdとuncollectedOnlyを同時指定した場合はエラーをスローする", async () => {
      await expect(
        fetchUserLinks({
          collectionId: "550e8400-e29b-41d4-a716-446655440099",
          uncollectedOnly: true,
        }),
      ).rejects.toThrow(
        "collectionId and uncollectedOnly cannot be used together",
      );
    });
  });
});
