import { act, renderHook, waitFor } from "@testing-library/react-native";

import { deleteCollection } from "../../api/deleteCollection.api";
import { collectionQueryKeys, linkQueryKeys } from "../../constants/queryKeys";
import { useDeleteCollection } from "../../hooks/useDeleteCollection";
import { clearQueryCache, testQueryClient, wrapper } from "../test-utils";

jest.mock("../../api/deleteCollection.api", () => ({
  deleteCollection: jest.fn(),
}));

describe("useDeleteCollection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    clearQueryCache();
  });

  it("mutate 成功時に collectionQueryKeys.all を invalidate する", async () => {
    (deleteCollection as jest.Mock).mockResolvedValueOnce(undefined);

    const invalidateQueriesSpy = jest.spyOn(
      testQueryClient,
      "invalidateQueries",
    );

    const { result } = renderHook(() => useDeleteCollection(), { wrapper });

    act(() => {
      result.current.deleteCollection("col-1");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: collectionQueryKeys.all,
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: linkQueryKeys.dashboardOverviewPrefix(),
    });

    invalidateQueriesSpy.mockRestore();
  });

  it("Supabase エラー時に isError が true になる", async () => {
    const mockError = new Error("API Error");
    (deleteCollection as jest.Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useDeleteCollection(), { wrapper });

    act(() => {
      result.current.deleteCollection("col-1");
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(mockError);
  });
});
