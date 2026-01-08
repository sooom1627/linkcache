import { act, renderHook, waitFor } from "@testing-library/react-native";

import { deleteLinkById } from "../../api/deleteLink.api";
import { linkQueryKeys } from "../../constants/queryKeys";
import { useDeleteLink } from "../../hooks/useDeleteLink";
import { clearQueryCache, testQueryClient, wrapper } from "../test-utils";

// API層のモック
jest.mock("../../api/deleteLink.api", () => ({
  deleteLinkById: jest.fn(),
}));

const mockDeleteLinkById = jest.mocked(deleteLinkById);

// テスト用の有効なUUID
const MOCK_LINK_ID = "550e8400-e29b-41d4-a716-446655440000";

describe("useDeleteLink", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // React Queryのキャッシュをクリアしてテスト間のキャッシュ汚染を防止
    clearQueryCache();
  });

  it("returns mutation state", () => {
    const { result } = renderHook(() => useDeleteLink(), { wrapper });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(typeof result.current.deleteLink).toBe("function");
  });

  it("calls deleteLinkById API on mutation", async () => {
    mockDeleteLinkById.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteLink(), { wrapper });

    act(() => {
      result.current.deleteLink(MOCK_LINK_ID);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // React Query v5ではmutationFnに追加のコンテキスト情報が渡されるため、
    // 第1引数（linkId）のみを検証
    expect(mockDeleteLinkById.mock.calls[0][0]).toBe(MOCK_LINK_ID);
  });

  it("sets error state when API call fails", async () => {
    const mockError = new Error("API Error");
    mockDeleteLinkById.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useDeleteLink(), { wrapper });

    act(() => {
      result.current.deleteLink(MOCK_LINK_ID);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(mockError);
  });

  it("shows pending state during mutation", async () => {
    // 遅延させたPromiseでpending状態をテスト
    let resolveDelete: (value: unknown) => void;
    const delayedDelete = new Promise((resolve) => {
      resolveDelete = resolve;
    });

    mockDeleteLinkById.mockReturnValueOnce(delayedDelete as Promise<void>);

    const { result } = renderHook(() => useDeleteLink(), { wrapper });

    act(() => {
      result.current.deleteLink(MOCK_LINK_ID);
    });

    // mutationが開始されるのを待つ
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    // Promise解決
    await act(async () => {
      resolveDelete!(undefined);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });

  it("invalidates link list cache on successful deletion", async () => {
    mockDeleteLinkById.mockResolvedValueOnce(undefined);

    // invalidateQueriesをスパイ
    const invalidateQueriesSpy = jest.spyOn(
      testQueryClient,
      "invalidateQueries",
    );

    const { result } = renderHook(() => useDeleteLink(), { wrapper });

    act(() => {
      result.current.deleteLink(MOCK_LINK_ID);
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

    invalidateQueriesSpy.mockRestore();
  });
});
