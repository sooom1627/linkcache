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
      queryKey: collectionQueryKeys.links(MOCK_COLLECTION_ID),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: linkQueryKeys.detail(MOCK_LINK_ID),
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
});
