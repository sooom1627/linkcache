import { renderHook, waitFor } from "@testing-library/react-native";

import { supabase } from "@/src/shared/lib/supabase";

import { linkQueryKeys } from "../../constants/queryKeys";
import { useUncollectedLinksCount } from "../../hooks/useUncollectedLinksCount";
import { clearQueryCache, testQueryClient, wrapper } from "../test-utils";

// Mock only the external Supabase boundary
jest.mock("@/src/shared/lib/supabase", () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

const mockRpc = supabase.rpc as jest.Mock;

describe("useUncollectedLinksCount", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearQueryCache();
  });

  afterEach(() => {
    clearQueryCache();
  });

  it("uncollected件数だけを取得して返す", async () => {
    mockRpc.mockResolvedValueOnce({
      data: {
        data: [],
        hasMore: false,
        totalCount: 7,
      },
      error: null,
    });

    const { result } = renderHook(() => useUncollectedLinksCount(), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify fetchUserLinks was called with correct params via the Supabase RPC
    expect(mockRpc).toHaveBeenCalledWith("get_user_links", {
      p_page_size: 1,
      p_page: 0,
      p_status: null,
      p_is_read: null,
      p_limit: null,
      p_order_by: null,
      p_collection_id: null,
      p_uncollected_only: true,
    });
    expect(result.current.count).toBe(7);

    const queries = testQueryClient.getQueryCache().findAll({
      queryKey: linkQueryKeys.uncollectedCount(),
    });
    expect(queries).toHaveLength(1);
  });

  it("エラー時にisErrorとerrorを返す", async () => {
    const mockError = new Error("API Error");
    mockRpc.mockResolvedValueOnce({
      data: null,
      error: mockError,
    });

    const { result } = renderHook(() => useUncollectedLinksCount(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(mockError);
    expect(result.current.count).toBe(0);
  });
});
