import {
  renderHook,
  waitFor,
  type RenderHookResult,
} from "@testing-library/react-native";

import { getLinkById } from "../../api/getLink.api";
import { useLinkDetail } from "../../hooks/useLinkDetail";
import type { UserLink } from "../../types/linkList.types";
import { clearQueryCache, wrapper } from "../test-utils";

// API関数をモック
jest.mock("../../api/getLink.api", () => ({
  getLinkById: jest.fn(),
}));

const mockGetLinkById = jest.mocked(getLinkById);

// モックデータ
const createMockLink = (id: string): UserLink => ({
  status_id: `status-${id}`,
  user_id: "user-1",
  status: "read_soon" as const,
  triaged_at: "2025-01-01T00:00:00Z",
  read_at: null,
  saved_at: "2025-01-01T00:00:00Z",
  link_id: id,
  url: `https://example.com/${id}`,
  title: `Example Link ${id}`,
  description: `Description for link ${id}`,
  image_url: `https://example.com/image-${id}.jpg`,
  favicon_url: `https://example.com/favicon-${id}.ico`,
  site_name: "Example Site",
  link_created_at: "2025-01-01T00:00:00Z",
});

describe("useLinkDetail", () => {
  const mockLinkId = "123e4567-e89b-12d3-a456-426614174000";

  beforeEach(() => {
    jest.clearAllMocks();
    clearQueryCache();
  });

  it("link_idを指定してリンク詳細データを取得できる", async () => {
    // Given: 有効なlink_id
    const mockLink = createMockLink(mockLinkId);
    mockGetLinkById.mockResolvedValueOnce(mockLink);

    // When: useLinkDetail(link_id)を呼び出す
    const { result } = renderHook(() => useLinkDetail(mockLinkId), {
      wrapper,
    }) as RenderHookResult<
      ReturnType<typeof useLinkDetail>,
      { linkId: string }
    >;

    // Then: data, isLoading, errorが適切に返される
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockLink);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBe(null);
    expect(mockGetLinkById).toHaveBeenCalledWith(mockLinkId);
  });

  it("ローディング中は isLoading が true になる", async () => {
    // Given: API呼び出し中
    mockGetLinkById.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(createMockLink(mockLinkId)), 100);
        }),
    );

    // When: フックを呼び出す
    const { result } = renderHook(() => useLinkDetail(mockLinkId), {
      wrapper,
    });

    // Then: isLoading === true
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // API呼び出しが完了するまで待つ
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("エラー時は error にエラー情報が設定される", async () => {
    // Given: API呼び出しがエラー
    const mockError = new Error("Failed to fetch link");
    mockGetLinkById.mockRejectedValueOnce(mockError);

    // When: フックを呼び出す
    const { result } = renderHook(() => useLinkDetail(mockLinkId), {
      wrapper,
    });

    // Then: error にエラー情報が含まれる
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });

  it("同じlink_idの場合はキャッシュが使用される", async () => {
    // Given: すでにキャッシュされたデータ
    const mockLink = createMockLink(mockLinkId);
    mockGetLinkById.mockResolvedValue(mockLink);

    // 1回目の呼び出し
    const { result: result1, unmount } = renderHook(
      () => useLinkDetail(mockLinkId),
      {
        wrapper,
      },
    );

    await waitFor(() => {
      expect(result1.current.isLoading).toBe(false);
    });

    expect(mockGetLinkById).toHaveBeenCalledTimes(1);
    const firstData = result1.current.data;

    unmount();

    // When: 同じlink_idでフックを再度呼び出す（短時間内）
    const { result: result2 } = renderHook(() => useLinkDetail(mockLinkId), {
      wrapper,
    });

    // Then: キャッシュから即座にデータが取得される
    expect(result2.current.data).toEqual(firstData);

    await waitFor(() => {
      expect(result2.current.isLoading).toBe(false);
    });
  });
});
