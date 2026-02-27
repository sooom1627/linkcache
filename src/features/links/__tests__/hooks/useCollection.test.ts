import { renderHook, waitFor } from "@testing-library/react-native";

import { getCollection } from "../../api/getCollection.api";
import { collectionQueryKeys } from "../../constants/queryKeys";
import { useCollection } from "../../hooks/useCollection";
import { clearQueryCache, testQueryClient, wrapper } from "../test-utils";

jest.mock("../../api/getCollection.api", () => ({
  getCollection: jest.fn(),
}));

describe("useCollection", () => {
  const MOCK_COLLECTION = {
    id: "col-1",
    name: "My Collection",
    emoji: "📚",
    itemsCount: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getCollection as jest.Mock).mockResolvedValue(MOCK_COLLECTION);
  });

  afterEach(() => {
    clearQueryCache();
  });

  it("returns collection, isLoading, isError, error, refetch", () => {
    const { result } = renderHook(() => useCollection("col-1"), { wrapper });

    expect(result.current).toHaveProperty("collection");
    expect(result.current).toHaveProperty("isLoading");
    expect(result.current).toHaveProperty("isError");
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("refetch");
    expect(typeof result.current.refetch).toBe("function");
  });

  it("calls getCollection and returns collection on success", async () => {
    const { result } = renderHook(() => useCollection("col-1"), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getCollection).toHaveBeenCalledWith("col-1");
    expect(result.current.collection).toEqual(MOCK_COLLECTION);
    expect(result.current.isError).toBe(false);
  });

  it("does not fetch when id is empty string", async () => {
    const { result } = renderHook(() => useCollection(""), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getCollection).not.toHaveBeenCalled();
    expect(result.current.collection).toBeNull();
  });

  it("sets isError when API call fails", async () => {
    const mockError = new Error("API Error");
    (getCollection as jest.Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useCollection("col-1"), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(mockError);
    expect(result.current.collection).toBeNull();
  });

  it("uses collectionQueryKeys.detail for query key", async () => {
    const { result } = renderHook(() => useCollection("col-1"), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const queryCache = testQueryClient.getQueryCache();
    const queries = queryCache.findAll({
      queryKey: collectionQueryKeys.detail("col-1"),
    });
    expect(queries).toHaveLength(1);
  });
});
