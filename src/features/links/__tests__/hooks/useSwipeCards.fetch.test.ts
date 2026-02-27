import { renderHook, waitFor } from "@testing-library/react-native";

import { createMockLink } from "../../__mocks__/linkHelpers";
import { fetchUserLinks } from "../../api/fetchLinks.api";
import { useSwipeCards } from "../../hooks/useSwipeCards";
import { clearQueryCache, wrapper } from "../test-utils";

jest.mock("../../api/fetchLinks.api", () => ({
  fetchUserLinks: jest.fn(),
}));

jest.mock("../../api/updateLinkStatus.api", () => ({
  updateLinkStatus: jest.fn(),
}));

const mockFetchUserLinks = jest.mocked(fetchUserLinks);

describe("useSwipeCards - データ取得", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearQueryCache();
  });

  afterEach(() => {
    clearQueryCache();
  });

  it("newのカードデータを取得する", async () => {
    const mockLink1 = createMockLink(1, { status: "new" });
    const mockLink2 = createMockLink(2, { status: "new" });
    const mockLink3 = createMockLink(3, { status: "new" });
    mockFetchUserLinks.mockResolvedValueOnce({
      data: [mockLink1, mockLink2, mockLink3],
      hasMore: false,
      totalCount: 3,
    });

    const { result } = renderHook(() => useSwipeCards({ sourceType: "new" }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.cards).toHaveLength(3);
    });

    expect(result.current.cards[0]).toEqual(mockLink1);
    expect(result.current.error).toBeNull();
  });

  it("stockのカードデータを取得する", async () => {
    const mockLink1 = createMockLink(1, { status: "stock" });
    mockFetchUserLinks.mockResolvedValueOnce({
      data: [mockLink1],
      hasMore: false,
      totalCount: 1,
    });

    const { result } = renderHook(
      () => useSwipeCards({ sourceType: "stock" }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.cards).toHaveLength(1);
    });
    expect(mockFetchUserLinks).toHaveBeenCalledWith(
      expect.objectContaining({ status: "stock" }),
    );
  });

  it("read_soonのカードデータを取得し、triaged_at_ascでソートする", async () => {
    const mockLink1 = createMockLink(1, { status: "read_soon" });
    const mockLink2 = createMockLink(2, { status: "read_soon" });
    mockFetchUserLinks.mockResolvedValueOnce({
      data: [mockLink1, mockLink2],
      hasMore: false,
      totalCount: 2,
    });

    const { result } = renderHook(
      () => useSwipeCards({ sourceType: "read_soon" }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.cards).toHaveLength(2);
    });
    expect(mockFetchUserLinks).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "read_soon",
        orderBy: "triaged_at_asc",
      }),
    );
  });

  it("デフォルトでnewを取得する", async () => {
    mockFetchUserLinks.mockResolvedValueOnce({
      data: [],
      hasMore: false,
      totalCount: 0,
    });

    renderHook(() => useSwipeCards(), { wrapper });

    await waitFor(() => {
      expect(mockFetchUserLinks).toHaveBeenCalledWith(
        expect.objectContaining({ status: "new" }),
      );
    });
  });
});
