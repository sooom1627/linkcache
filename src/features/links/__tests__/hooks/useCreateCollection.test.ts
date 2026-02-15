import { act, renderHook, waitFor } from "@testing-library/react-native";

import { createCollection } from "../../api/createCollection.api";
import { collectionQueryKeys } from "../../constants/queryKeys";
import { useCreateCollection } from "../../hooks/useCreateCollection";
import { clearQueryCache, testQueryClient, wrapper } from "../test-utils";

jest.mock("../../api/createCollection.api", () => ({
  createCollection: jest.fn(),
}));

describe("useCreateCollection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    clearQueryCache();
  });

  it("returns mutation state", () => {
    const { result } = renderHook(() => useCreateCollection(), { wrapper });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(typeof result.current.createCollection).toBe("function");
  });

  it("calls createCollection API and sets isSuccess on success", async () => {
    const mockCollection = {
      id: "col-1",
      user_id: "user-1",
      name: "My Collection",
      description: null,
      emoji: "📚",
      created_at: "2026-02-15T00:00:00Z",
      updated_at: "2026-02-15T00:00:00Z",
    };
    (createCollection as jest.Mock).mockResolvedValueOnce(mockCollection);

    const { result } = renderHook(() => useCreateCollection(), { wrapper });

    act(() => {
      result.current.createCollection({ name: "My Collection", emoji: "📚" });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(createCollection).toHaveBeenCalledWith(
      { name: "My Collection", emoji: "📚" },
      expect.anything(),
    );
    expect(result.current.data).toEqual(mockCollection);
  });

  it("invalidates collection lists cache on successful creation", async () => {
    const mockCollection = {
      id: "col-1",
      user_id: "user-1",
      name: "Test",
      description: null,
      emoji: null,
      created_at: "2026-02-15T00:00:00Z",
      updated_at: "2026-02-15T00:00:00Z",
    };
    (createCollection as jest.Mock).mockResolvedValueOnce(mockCollection);

    const invalidateQueriesSpy = jest.spyOn(
      testQueryClient,
      "invalidateQueries",
    );

    const { result } = renderHook(() => useCreateCollection(), { wrapper });

    act(() => {
      result.current.createCollection({ name: "Test" });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: collectionQueryKeys.lists(),
    });

    invalidateQueriesSpy.mockRestore();
  });

  it("sets isError when API call fails", async () => {
    const mockError = new Error("API Error");
    (createCollection as jest.Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useCreateCollection(), { wrapper });

    act(() => {
      result.current.createCollection({ name: "My Collection" });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(mockError);
  });

  it("shows pending state during mutation", async () => {
    let resolveCreate: (value: unknown) => void;
    const delayedCreate = new Promise((resolve) => {
      resolveCreate = resolve;
    });
    (createCollection as jest.Mock).mockReturnValueOnce(delayedCreate);

    const { result } = renderHook(() => useCreateCollection(), { wrapper });

    act(() => {
      result.current.createCollection({ name: "My Collection" });
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    await act(async () => {
      resolveCreate!({
        id: "col-1",
        user_id: "user-1",
        name: "My Collection",
        description: null,
        emoji: null,
        created_at: "2026-02-15T00:00:00Z",
        updated_at: "2026-02-15T00:00:00Z",
      });
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });
});
