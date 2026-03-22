import { act, renderHook, waitFor } from "@testing-library/react-native";

import { removeLinkFromCollection } from "../../api/removeLinkFromCollection.api";
import { collectionQueryKeys, linkQueryKeys } from "../../constants/queryKeys";
import { useRemoveLinkFromCollection } from "../../hooks/useRemoveLinkFromCollection";
import { clearQueryCache, testQueryClient, wrapper } from "../test-utils";

jest.mock("../../api/removeLinkFromCollection.api", () => ({
  removeLinkFromCollection: jest.fn(),
}));

const MOCK_COLLECTION_ID = "col-1";
const MOCK_LINK_ID = "link-1";

describe("useRemoveLinkFromCollection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    clearQueryCache();
  });

  it("returns mutation state", () => {
    const { result } = renderHook(() => useRemoveLinkFromCollection(), {
      wrapper,
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(typeof result.current.removeLinkFromCollection).toBe("function");
    expect(typeof result.current.removeLinkFromCollectionAsync).toBe(
      "function",
    );
  });

  it("calls removeLinkFromCollection API on mutate", async () => {
    (removeLinkFromCollection as jest.Mock).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useRemoveLinkFromCollection(), {
      wrapper,
    });

    act(() => {
      result.current.removeLinkFromCollection({
        collectionId: MOCK_COLLECTION_ID,
        linkId: MOCK_LINK_ID,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(removeLinkFromCollection).toHaveBeenCalledWith(
      { collectionId: MOCK_COLLECTION_ID, linkId: MOCK_LINK_ID },
      expect.anything(),
    );
  });

  it("invalidates collection links and link detail on success", async () => {
    (removeLinkFromCollection as jest.Mock).mockResolvedValueOnce(undefined);

    const invalidateSpy = jest.spyOn(testQueryClient, "invalidateQueries");

    const { result } = renderHook(() => useRemoveLinkFromCollection(), {
      wrapper,
    });

    act(() => {
      result.current.removeLinkFromCollection({
        collectionId: MOCK_COLLECTION_ID,
        linkId: MOCK_LINK_ID,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: collectionQueryKeys.lists(),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: collectionQueryKeys.links(MOCK_COLLECTION_ID),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: collectionQueryKeys.forLink(MOCK_LINK_ID),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: linkQueryKeys.detail(MOCK_LINK_ID),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: linkQueryKeys.uncollectedList(),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: linkQueryKeys.uncollectedCount(),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: linkQueryKeys.dashboardOverviewPrefix(),
    });

    invalidateSpy.mockRestore();
  });

  it("applies optimistic update by removing collectionId from cache", async () => {
    (removeLinkFromCollection as jest.Mock).mockResolvedValueOnce(undefined);

    const queryKey = collectionQueryKeys.forLink(MOCK_LINK_ID);
    testQueryClient.setQueryData<string[]>(queryKey, [
      MOCK_COLLECTION_ID,
      "other-col",
    ]);

    const setDataSpy = jest.spyOn(testQueryClient, "setQueryData");

    const { result } = renderHook(() => useRemoveLinkFromCollection(), {
      wrapper,
    });

    act(() => {
      result.current.removeLinkFromCollection({
        collectionId: MOCK_COLLECTION_ID,
        linkId: MOCK_LINK_ID,
      });
    });

    // waitFor で setQueryData の updater 呼び出しを待つ（未解決 Promise を避ける）
    await waitFor(() => {
      const relevantCall = setDataSpy.mock.calls.find(
        ([key, updater]) =>
          JSON.stringify(key) === JSON.stringify(queryKey) &&
          typeof updater === "function",
      );
      expect(relevantCall).toBeDefined();

      // updater 関数が collectionId を除外することを検証
      const updater = relevantCall![1] as (
        old: string[] | undefined,
      ) => string[];
      expect(updater([MOCK_COLLECTION_ID, "other-col"])).toEqual(["other-col"]);
    });

    setDataSpy.mockRestore();
  });

  it("rolls back optimistic update on API failure", async () => {
    const mockError = new Error("API Error");
    (removeLinkFromCollection as jest.Mock).mockRejectedValueOnce(mockError);

    const queryKey = collectionQueryKeys.forLink(MOCK_LINK_ID);
    const previousData = [MOCK_COLLECTION_ID, "other-col"];
    testQueryClient.setQueryData<string[]>(queryKey, previousData);

    const setDataSpy = jest.spyOn(testQueryClient, "setQueryData");

    const { result } = renderHook(() => useRemoveLinkFromCollection(), {
      wrapper,
    });

    act(() => {
      result.current.removeLinkFromCollection({
        collectionId: MOCK_COLLECTION_ID,
        linkId: MOCK_LINK_ID,
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // onError がロールバックのために previousIds で setQueryData を呼んでいることを確認
    expect(setDataSpy).toHaveBeenCalledWith(queryKey, previousData);

    setDataSpy.mockRestore();
  });

  it("sets isError when API fails", async () => {
    const mockError = new Error("API Error");
    (removeLinkFromCollection as jest.Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useRemoveLinkFromCollection(), {
      wrapper,
    });

    act(() => {
      result.current.removeLinkFromCollection({
        collectionId: MOCK_COLLECTION_ID,
        linkId: MOCK_LINK_ID,
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(mockError);
  });
});
