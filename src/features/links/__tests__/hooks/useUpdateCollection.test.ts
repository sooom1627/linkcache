import { act, renderHook, waitFor } from "@testing-library/react-native";

import { updateCollection } from "../../api/updateCollection.api";
import { collectionQueryKeys } from "../../constants/queryKeys";
import { useUpdateCollection } from "../../hooks/useUpdateCollection";
import { clearQueryCache, testQueryClient, wrapper } from "../test-utils";

jest.mock("../../api/updateCollection.api", () => ({
  updateCollection: jest.fn(),
}));

describe("useUpdateCollection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    clearQueryCache();
  });

  it("mutate 成功時に collections.lists() を invalidate する", async () => {
    const mockCollection = {
      id: "col-1",
      user_id: "user-1",
      name: "Updated Name",
      emoji: "🎯",
      created_at: "2026-02-15T00:00:00Z",
      updated_at: "2026-02-15T00:00:00Z",
    };
    (updateCollection as jest.Mock).mockResolvedValueOnce(mockCollection);

    const invalidateQueriesSpy = jest.spyOn(
      testQueryClient,
      "invalidateQueries",
    );

    const { result } = renderHook(() => useUpdateCollection(), { wrapper });

    act(() => {
      result.current.updateCollection({
        id: "col-1",
        params: { name: "Updated Name", emoji: "🎯" },
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: collectionQueryKeys.lists(),
    });

    invalidateQueriesSpy.mockRestore();
  });

  it("mutate 成功時に collections.detail(id) を invalidate する", async () => {
    const mockCollection = {
      id: "col-1",
      user_id: "user-1",
      name: "Updated Name",
      emoji: "🎯",
      created_at: "2026-02-15T00:00:00Z",
      updated_at: "2026-02-15T00:00:00Z",
    };
    (updateCollection as jest.Mock).mockResolvedValueOnce(mockCollection);

    const invalidateQueriesSpy = jest.spyOn(
      testQueryClient,
      "invalidateQueries",
    );

    const { result } = renderHook(() => useUpdateCollection(), { wrapper });

    act(() => {
      result.current.updateCollection({
        id: "col-1",
        params: { name: "Updated Name" },
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: collectionQueryKeys.detail("col-1"),
    });

    invalidateQueriesSpy.mockRestore();
  });

  it("Supabase エラー時に isError が true になる", async () => {
    const mockError = new Error("API Error");
    (updateCollection as jest.Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useUpdateCollection(), { wrapper });

    act(() => {
      result.current.updateCollection({
        id: "col-1",
        params: { name: "Updated Name" },
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(mockError);
  });
});
