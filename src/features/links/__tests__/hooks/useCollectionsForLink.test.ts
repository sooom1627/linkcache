import { renderHook, waitFor } from "@testing-library/react-native";

import { fetchCollectionIdsByLink } from "../../api/fetchCollectionIdsByLink.api";
import { useCollectionsForLink } from "../../hooks/useCollectionsForLink";
import { clearQueryCache, wrapper } from "../test-utils";

jest.mock("../../api/fetchCollectionIdsByLink.api", () => ({
  fetchCollectionIdsByLink: jest.fn(),
}));

describe("useCollectionsForLink", () => {
  const mockFetchCollectionIdsByLink = jest.mocked(fetchCollectionIdsByLink);
  const MOCK_LINK_ID = "770e8400-e29b-41d4-a716-446655440002";
  const MOCK_COLLECTION_IDS = [
    "660e8400-e29b-41d4-a716-446655440001",
    "660e8400-e29b-41d4-a716-446655440003",
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchCollectionIdsByLink.mockResolvedValue(MOCK_COLLECTION_IDS);
  });

  afterEach(() => {
    clearQueryCache();
  });

  it("returns linkedCollectionIds, isLoading, isError, error, refetch", () => {
    const { result } = renderHook(() => useCollectionsForLink(MOCK_LINK_ID), {
      wrapper,
    });

    expect(result.current).toHaveProperty("linkedCollectionIds");
    expect(result.current).toHaveProperty("isLoading");
    expect(result.current).toHaveProperty("isError");
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("refetch");
    expect(typeof result.current.refetch).toBe("function");
  });

  it("calls fetchCollectionIdsByLink and returns linkedCollectionIds as Set on success", async () => {
    const { result } = renderHook(() => useCollectionsForLink(MOCK_LINK_ID), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchCollectionIdsByLink).toHaveBeenCalledWith(MOCK_LINK_ID);
    expect(result.current.linkedCollectionIds).toBeInstanceOf(Set);
    expect(result.current.linkedCollectionIds.size).toBe(2);
    expect(result.current.linkedCollectionIds.has(MOCK_COLLECTION_IDS[0])).toBe(
      true,
    );
    expect(result.current.linkedCollectionIds.has(MOCK_COLLECTION_IDS[1])).toBe(
      true,
    );
    expect(result.current.isError).toBe(false);
  });

  it("does not fetch when linkId is empty string", async () => {
    const { result } = renderHook(() => useCollectionsForLink(""), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchCollectionIdsByLink).not.toHaveBeenCalled();
    expect(result.current.linkedCollectionIds.size).toBe(0);
  });

  it("returns empty Set when API returns empty array", async () => {
    mockFetchCollectionIdsByLink.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useCollectionsForLink(MOCK_LINK_ID), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.linkedCollectionIds).toBeInstanceOf(Set);
    expect(result.current.linkedCollectionIds.size).toBe(0);
  });

  it("sets isError and error when API fails", async () => {
    const mockError = new Error("API error");
    mockFetchCollectionIdsByLink.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useCollectionsForLink(MOCK_LINK_ID), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(mockError);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.linkedCollectionIds.size).toBe(0);
  });
});
