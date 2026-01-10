import { act, renderHook, waitFor } from "@testing-library/react-native";

import { updateLinkReadStatus } from "../../api/updateLinkReadStatus.api";
import { linkQueryKeys } from "../../constants/queryKeys";
import { useUpdateLinkReadStatus } from "../../hooks/useUpdateLinkReadStatus";
import { clearQueryCache, testQueryClient, wrapper } from "../test-utils";

// API層のモック
jest.mock("../../api/updateLinkReadStatus.api", () => ({
  updateLinkReadStatus: jest.fn(),
}));

const mockUpdateLinkReadStatus = jest.mocked(updateLinkReadStatus);

// テスト用の有効なUUID
const MOCK_LINK_ID = "550e8400-e29b-41d4-a716-446655440000";

describe("useUpdateLinkReadStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // React Queryのキャッシュをクリアしてテスト間のキャッシュ汚染を防止
    clearQueryCache();
  });

  it("returns mutation state", () => {
    const { result } = renderHook(() => useUpdateLinkReadStatus(), { wrapper });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(typeof result.current.updateReadStatus).toBe("function");
  });

  it("calls updateLinkReadStatus API on mutation with correct parameters", async () => {
    mockUpdateLinkReadStatus.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useUpdateLinkReadStatus(), { wrapper });

    act(() => {
      result.current.updateReadStatus(MOCK_LINK_ID, true);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // React Query v5ではmutationFnに追加のコンテキスト情報が渡されるため、
    // 第1引数（linkId）と第2引数（isRead）のみを検証
    expect(mockUpdateLinkReadStatus.mock.calls[0][0]).toBe(MOCK_LINK_ID);
    expect(mockUpdateLinkReadStatus.mock.calls[0][1]).toBe(true);
  });

  it("calls updateLinkReadStatus API with false when marking as unread", async () => {
    mockUpdateLinkReadStatus.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useUpdateLinkReadStatus(), { wrapper });

    act(() => {
      result.current.updateReadStatus(MOCK_LINK_ID, false);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockUpdateLinkReadStatus.mock.calls[0][0]).toBe(MOCK_LINK_ID);
    expect(mockUpdateLinkReadStatus.mock.calls[0][1]).toBe(false);
  });

  it("sets error state when API call fails", async () => {
    const mockError = new Error("API Error");
    mockUpdateLinkReadStatus.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useUpdateLinkReadStatus(), { wrapper });

    act(() => {
      result.current.updateReadStatus(MOCK_LINK_ID, true);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(mockError);
  });

  it("shows pending state during mutation", async () => {
    // 遅延させたPromiseでpending状態をテスト
    let resolveUpdate: (value: unknown) => void;
    const delayedUpdate = new Promise((resolve) => {
      resolveUpdate = resolve;
    });

    mockUpdateLinkReadStatus.mockReturnValueOnce(
      delayedUpdate as Promise<void>,
    );

    const { result } = renderHook(() => useUpdateLinkReadStatus(), { wrapper });

    act(() => {
      result.current.updateReadStatus(MOCK_LINK_ID, true);
    });

    // mutationが開始されるのを待つ
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    // Promise解決
    await act(async () => {
      resolveUpdate!(undefined);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });

  it("invalidates link list and detail cache on successful update", async () => {
    mockUpdateLinkReadStatus.mockResolvedValueOnce(undefined);

    // invalidateQueriesをスパイ
    const invalidateQueriesSpy = jest.spyOn(
      testQueryClient,
      "invalidateQueries",
    );

    const { result } = renderHook(() => useUpdateLinkReadStatus(), { wrapper });

    act(() => {
      result.current.updateReadStatus(MOCK_LINK_ID, true);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // リンク一覧のキャッシュが無効化されることを確認
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: linkQueryKeys.lists(),
    });

    // リンク詳細のキャッシュが無効化されることを確認
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: linkQueryKeys.details(),
    });

    // 特定のリンクIDのキャッシュも無効化されることを確認
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: linkQueryKeys.detail(MOCK_LINK_ID),
    });

    invalidateQueriesSpy.mockRestore();
  });
});
