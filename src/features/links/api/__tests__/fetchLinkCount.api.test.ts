import { supabase } from "@/src/shared/lib/supabase";

import type { GetLinkCountParams } from "../../types/linkList.types";
import { fetchLinkCount } from "../fetchLinkCount.api";

// Supabase クライアントをモック
jest.mock("@/src/shared/lib/supabase", () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

const mockRpc = supabase.rpc as jest.Mock;

describe("fetchLinkCount", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("パラメータなしで呼び出した場合、全リンクのカウントを取得できる", async () => {
    // Given: モックレスポンス
    const mockCount = 42;
    mockRpc.mockResolvedValueOnce({
      data: mockCount,
      error: null,
    } as unknown as ReturnType<typeof mockRpc>);

    // When: fetchLinkCount()を呼び出す
    const result = await fetchLinkCount();

    // Then: 正しいカウントが返される
    expect(mockRpc).toHaveBeenCalledWith("get_user_links_count", {
      p_status: null,
      p_is_read: null,
    });
    expect(result).toEqual({ count: mockCount });
  });

  it("statusパラメータを指定した場合、フィルタされたカウントを取得できる", async () => {
    // Given: status="read_soon"でフィルタ
    const mockCount = 15;
    mockRpc.mockResolvedValueOnce({
      data: mockCount,
      error: null,
    } as unknown as ReturnType<typeof mockRpc>);

    const params: GetLinkCountParams = {
      status: "read_soon",
    };

    // When: fetchLinkCount(params)を呼び出す
    const result = await fetchLinkCount(params);

    // Then: 正しいカウントが返される
    expect(mockRpc).toHaveBeenCalledWith("get_user_links_count", {
      p_status: "read_soon",
      p_is_read: null,
    });
    expect(result).toEqual({ count: mockCount });
  });

  it("isReadパラメータを指定した場合、フィルタされたカウントを取得できる", async () => {
    // Given: isRead=trueでフィルタ
    const mockCount = 20;
    mockRpc.mockResolvedValueOnce({
      data: mockCount,
      error: null,
    } as unknown as ReturnType<typeof mockRpc>);

    const params: GetLinkCountParams = {
      isRead: true,
    };

    // When: fetchLinkCount(params)を呼び出す
    const result = await fetchLinkCount(params);

    // Then: 正しいカウントが返される
    expect(mockRpc).toHaveBeenCalledWith("get_user_links_count", {
      p_status: null,
      p_is_read: true,
    });
    expect(result).toEqual({ count: mockCount });
  });

  it("statusとisReadの両方を指定した場合、フィルタされたカウントを取得できる", async () => {
    // Given: status="new", isRead=falseでフィルタ
    const mockCount = 10;
    mockRpc.mockResolvedValueOnce({
      data: mockCount,
      error: null,
    } as unknown as ReturnType<typeof mockRpc>);

    const params: GetLinkCountParams = {
      status: "new",
      isRead: false,
    };

    // When: fetchLinkCount(params)を呼び出す
    const result = await fetchLinkCount(params);

    // Then: 正しいカウントが返される
    expect(mockRpc).toHaveBeenCalledWith("get_user_links_count", {
      p_status: "new",
      p_is_read: false,
    });
    expect(result).toEqual({ count: mockCount });
  });

  it("Supabaseエラーが発生した場合、エラーをthrowする", async () => {
    // Given: Supabaseエラー
    const mockError = { message: "Database error", code: "PGRST116" };
    mockRpc.mockResolvedValueOnce({
      data: null,
      error: mockError,
    } as unknown as ReturnType<typeof mockRpc>);

    // When & Then: fetchLinkCount()を呼び出すとエラーがthrowされる
    await expect(fetchLinkCount()).rejects.toEqual(mockError);
  });

  it("データが返されない場合はエラーをthrowする", async () => {
    // Given: データなし
    mockRpc.mockResolvedValueOnce({
      data: null,
      error: null,
    } as unknown as ReturnType<typeof mockRpc>);

    // When & Then: fetchLinkCount()を呼び出すとエラーがthrowされる
    await expect(fetchLinkCount()).rejects.toThrow("No data returned from RPC");
  });

  it("不正な形式のレスポンス（負の数）の場合はバリデーションエラーをthrowする", async () => {
    // Given: 不正な形式のデータ（負の数）
    mockRpc.mockResolvedValueOnce({
      data: -1,
      error: null,
    } as unknown as ReturnType<typeof mockRpc>);

    // When & Then: fetchLinkCount()を呼び出すとバリデーションエラーがthrowされる
    await expect(fetchLinkCount()).rejects.toThrow();
  });

  it("不正な形式のレスポンス（数値以外）の場合はバリデーションエラーをthrowする", async () => {
    // Given: 不正な形式のデータ（文字列）
    mockRpc.mockResolvedValueOnce({
      data: "invalid",
      error: null,
    } as unknown as ReturnType<typeof mockRpc>);

    // When & Then: fetchLinkCount()を呼び出すとバリデーションエラーがthrowされる
    await expect(fetchLinkCount()).rejects.toThrow();
  });
});
