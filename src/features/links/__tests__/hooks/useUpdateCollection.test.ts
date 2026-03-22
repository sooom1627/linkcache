import { act, renderHook, waitFor } from "@testing-library/react-native";

import { updateCollection } from "../../api/updateCollection.api";
import { collectionQueryKeys, linkQueryKeys } from "../../constants/queryKeys";
import { useUpdateCollection } from "../../hooks/useUpdateCollection";
import type { Collection } from "../../types/links.types";
import { clearQueryCache, testQueryClient, wrapper } from "../test-utils";

jest.mock("../../api/updateCollection.api", () => ({
  updateCollection: jest.fn(),
}));

const mockCollection: Collection = {
  id: "col-1",
  user_id: "user-1",
  name: "Updated Name",
  emoji: "🎯",
  created_at: "2026-02-15T00:00:00Z",
  updated_at: "2026-02-15T00:00:00Z",
};

describe("useUpdateCollection", () => {
  let invalidateQueriesSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    invalidateQueriesSpy = jest.spyOn(testQueryClient, "invalidateQueries");
  });

  afterEach(() => {
    invalidateQueriesSpy.mockRestore();
    clearQueryCache();
  });

  it("mutate 成功時に collections.lists() を invalidate する", async () => {
    (updateCollection as jest.Mock).mockResolvedValueOnce(mockCollection);

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
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: linkQueryKeys.dashboardOverviewPrefix(),
    });
  });

  it("mutate 成功時に collections.detail(id) を invalidate する", async () => {
    (updateCollection as jest.Mock).mockResolvedValueOnce(mockCollection);

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
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: linkQueryKeys.dashboardOverviewPrefix(),
    });
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
