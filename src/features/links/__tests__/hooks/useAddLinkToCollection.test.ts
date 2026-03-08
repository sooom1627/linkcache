import { act, renderHook, waitFor } from "@testing-library/react-native";

import { addLinkToCollection } from "../../api/addLinkToCollection.api";
import { collectionQueryKeys, linkQueryKeys } from "../../constants/queryKeys";
import { useAddLinkToCollection } from "../../hooks/useAddLinkToCollection";
import { clearQueryCache, testQueryClient, wrapper } from "../test-utils";

jest.mock("../../api/addLinkToCollection.api", () => ({
  addLinkToCollection: jest.fn(),
}));

const MOCK_COLLECTION_ID = "col-1";
const MOCK_LINK_ID = "link-1";

describe("useAddLinkToCollection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    clearQueryCache();
  });

  it("returns mutation state", () => {
    const { result } = renderHook(() => useAddLinkToCollection(), { wrapper });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(typeof result.current.addLinkToCollection).toBe("function");
    expect(typeof result.current.addLinkToCollectionAsync).toBe("function");
  });

  it("calls addLinkToCollection API on mutate", async () => {
    (addLinkToCollection as jest.Mock).mockResolvedValueOnce({
      collection_id: MOCK_COLLECTION_ID,
      link_id: MOCK_LINK_ID,
    });

    const { result } = renderHook(() => useAddLinkToCollection(), { wrapper });

    act(() => {
      result.current.addLinkToCollection({
        collectionId: MOCK_COLLECTION_ID,
        linkId: MOCK_LINK_ID,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(addLinkToCollection).toHaveBeenCalledWith(
      { collectionId: MOCK_COLLECTION_ID, linkId: MOCK_LINK_ID },
      expect.anything(),
    );
  });

  it("invalidates collection links and link detail on success", async () => {
    (addLinkToCollection as jest.Mock).mockResolvedValueOnce({});

    const invalidateSpy = jest.spyOn(testQueryClient, "invalidateQueries");

    const { result } = renderHook(() => useAddLinkToCollection(), { wrapper });

    act(() => {
      result.current.addLinkToCollection({
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

    invalidateSpy.mockRestore();
  });

  it("sets isError when API fails", async () => {
    const mockError = new Error("API Error");
    (addLinkToCollection as jest.Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useAddLinkToCollection(), { wrapper });

    act(() => {
      result.current.addLinkToCollection({
        collectionId: MOCK_COLLECTION_ID,
        linkId: MOCK_LINK_ID,
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(mockError);
  });

  it("楽観的更新: APIレスポンス前にforLinkキャッシュが即時更新され、成功後にクエリが無効化される", async () => {
    const initialIds = ["existing-col"];
    testQueryClient.setQueryData(
      collectionQueryKeys.forLink(MOCK_LINK_ID),
      initialIds,
    );

    // Defer API resolution so we can observe the optimistic state first
    let resolveApi!: (v: { collection_id: string; link_id: string }) => void;
    (addLinkToCollection as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveApi = resolve;
        }),
    );

    const invalidateSpy = jest.spyOn(testQueryClient, "invalidateQueries");
    const { result } = renderHook(() => useAddLinkToCollection(), { wrapper });

    act(() => {
      result.current.addLinkToCollection({
        collectionId: MOCK_COLLECTION_ID,
        linkId: MOCK_LINK_ID,
      });
    });

    // Wait for onMutate's async operations (cancelQueries + setQueryData) to complete
    await waitFor(() => {
      const data = testQueryClient.getQueryData<string[]>(
        collectionQueryKeys.forLink(MOCK_LINK_ID),
      );
      expect(data).toContain(MOCK_COLLECTION_ID);
      expect(data).toContain("existing-col");
    });
    // onSettled has not fired yet
    expect(invalidateSpy).not.toHaveBeenCalled();

    // Resolve API → onSettled fires → invalidation
    await act(async () => {
      resolveApi({ collection_id: MOCK_COLLECTION_ID, link_id: MOCK_LINK_ID });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: collectionQueryKeys.links(MOCK_COLLECTION_ID),
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

    invalidateSpy.mockRestore();
  });

  it("APIエラー時にforLinkキャッシュが元の状態にロールバックされる", async () => {
    const initialIds = ["existing-col"];
    testQueryClient.setQueryData(
      collectionQueryKeys.forLink(MOCK_LINK_ID),
      initialIds,
    );

    (addLinkToCollection as jest.Mock).mockRejectedValueOnce(new Error("fail"));

    const { result } = renderHook(() => useAddLinkToCollection(), { wrapper });

    act(() => {
      result.current.addLinkToCollection({
        collectionId: MOCK_COLLECTION_ID,
        linkId: MOCK_LINK_ID,
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // onError should have restored the original IDs
    expect(
      testQueryClient.getQueryData<string[]>(
        collectionQueryKeys.forLink(MOCK_LINK_ID),
      ),
    ).toEqual(initialIds);
  });
});
