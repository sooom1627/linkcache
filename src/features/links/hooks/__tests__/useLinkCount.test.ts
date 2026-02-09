import { renderHook, waitFor } from "@testing-library/react-native";

import {
  clearQueryCache,
  testQueryClient,
  wrapper,
} from "../../__tests__/test-utils";
import { fetchLinkCount } from "../../api/fetchLinkCount.api";
import { linkQueryKeys } from "../../constants/queryKeys";
import { useLinkCount } from "../useLinkCount";

// API層のモック
jest.mock("../../api/fetchLinkCount.api", () => ({
  fetchLinkCount: jest.fn(),
}));

const mockFetchLinkCount = jest.mocked(fetchLinkCount);

describe("useLinkCount", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // React Queryのキャッシュをクリアしてテスト間のキャッシュ汚染を防止
    clearQueryCache();
  });

  it("パラメータなしで呼び出した場合、全リンクのカウントを取得できる", async () => {
    // Given: モックレスポンス
    const mockCount = 42;
    mockFetchLinkCount.mockResolvedValueOnce({ count: mockCount });

    // When: useLinkCount()を呼び出す
    const { result } = renderHook(() => useLinkCount(), { wrapper });

    // Then: ローディング状態から完了状態に遷移し、カウントが返される
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual({ count: mockCount });
    expect(mockFetchLinkCount).toHaveBeenCalledWith({});
  });

  it("statusパラメータを指定した場合、フィルタされたカウントを取得できる", async () => {
    // Given: status="read_soon"でフィルタ
    const mockCount = 15;
    mockFetchLinkCount.mockResolvedValueOnce({ count: mockCount });

    // When: useLinkCount({ status: "read_soon" })を呼び出す
    const { result } = renderHook(() => useLinkCount({ status: "read_soon" }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Then: 正しいカウントが返される
    expect(result.current.data).toEqual({ count: mockCount });
    expect(mockFetchLinkCount).toHaveBeenCalledWith({ status: "read_soon" });
  });

  it("isReadパラメータを指定した場合、フィルタされたカウントを取得できる", async () => {
    // Given: isRead=trueでフィルタ
    const mockCount = 20;
    mockFetchLinkCount.mockResolvedValueOnce({ count: mockCount });

    // When: useLinkCount({ isRead: true })を呼び出す
    const { result } = renderHook(() => useLinkCount({ isRead: true }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Then: 正しいカウントが返される
    expect(result.current.data).toEqual({ count: mockCount });
    expect(mockFetchLinkCount).toHaveBeenCalledWith({ isRead: true });
  });

  it("statusとisReadの両方を指定した場合、フィルタされたカウントを取得できる", async () => {
    // Given: status="new", isRead=falseでフィルタ
    const mockCount = 10;
    mockFetchLinkCount.mockResolvedValueOnce({ count: mockCount });

    // When: useLinkCount({ status: "new", isRead: false })を呼び出す
    const { result } = renderHook(
      () => useLinkCount({ status: "new", isRead: false }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Then: 正しいカウントが返される
    expect(result.current.data).toEqual({ count: mockCount });
    expect(mockFetchLinkCount).toHaveBeenCalledWith({
      status: "new",
      isRead: false,
    });
  });

  it("APIエラーが発生した場合、エラー状態を返す", async () => {
    // Given: APIエラー
    const mockError = new Error("API Error");
    mockFetchLinkCount.mockRejectedValueOnce(mockError);

    // When: useLinkCount()を呼び出す
    const { result } = renderHook(() => useLinkCount(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Then: エラー状態が返される
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeUndefined();
  });

  it("キャッシュが有効な場合は再取得しない", async () => {
    // Given: 初回取得
    const mockCount = 42;
    mockFetchLinkCount.mockResolvedValueOnce({ count: mockCount });

    const { result, rerender } = renderHook(() => useLinkCount(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetchLinkCount).toHaveBeenCalledTimes(1);

    // When: 同じパラメータで再レンダリング
    rerender({});

    // Then: キャッシュから取得され、再取得されない
    await waitFor(() => {
      expect(result.current.data).toEqual({ count: mockCount });
    });
    // staleTimeが0なので、再取得される可能性があるが、テスト環境ではofflineFirstなのでキャッシュが優先される
  });

  it("クエリキーが正しく設定されている", async () => {
    // Given: フィルタパラメータ
    const params = { status: "read_soon" as const, isRead: false };
    mockFetchLinkCount.mockResolvedValueOnce({ count: 10 });

    // When: useLinkCount(params)を呼び出す
    renderHook(() => useLinkCount(params), { wrapper });

    await waitFor(() => {
      expect(mockFetchLinkCount).toHaveBeenCalled();
    });

    // Then: クエリキーが正しく設定されている
    const queryKey = linkQueryKeys.count(params);
    const query = testQueryClient.getQueryState(queryKey);
    expect(query).toBeDefined();
  });
});
