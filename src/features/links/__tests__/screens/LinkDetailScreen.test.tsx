import { render, screen } from "@testing-library/react-native";

import { createMockLink } from "../../__mocks__/linkHelpers";
import { LinkDetailScreen } from "../../screens/LinkDetailScreen";
import { clearQueryCache, wrapper } from "../test-utils";

jest.mock("@/src/shared/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: {} }, error: null }),
    },
  },
}));

const mockUseLinkDetail = jest.fn();
const mockUseCollections = jest.fn();
const mockUseCollectionsForLink = jest.fn();
const mockUseAddLinkToCollection = jest.fn();

jest.mock("../../hooks/useLinkDetail", () => ({
  useLinkDetail: (...args: unknown[]) => mockUseLinkDetail(...args),
}));

jest.mock("../../hooks/useCollections", () => ({
  useCollections: (...args: unknown[]) => mockUseCollections(...args),
}));

jest.mock("../../hooks/useCollectionsForLink", () => ({
  useCollectionsForLink: (...args: unknown[]) =>
    mockUseCollectionsForLink(...args),
}));

jest.mock("../../hooks/useAddLinkToCollection", () => ({
  useAddLinkToCollection: () => mockUseAddLinkToCollection(),
}));

jest.mock("../../hooks/useDeleteLink", () => ({
  useDeleteLink: () => ({
    deleteLinkAsync: jest.fn(),
    isPending: false,
  }),
}));

jest.mock("../../hooks/useOpenLink", () => ({
  useOpenLink: () => ({
    openLink: jest.fn(),
  }),
}));

jest.mock("@/src/shared/hooks/useBottomSheetModal", () => ({
  useBottomSheetModal: () => ({
    ref: { current: null },
    present: jest.fn(),
    dismiss: jest.fn(),
  }),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
}));

const MOCK_LINK = createMockLink(1, {
  status: "read_soon",
  link_id: "link-1",
  url: "https://example.com",
  title: "Example Title",
});
const MOCK_COLLECTIONS = [
  { id: "col-1", name: "Collection 1", emoji: "📚", itemsCount: 2 },
];

describe("LinkDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearQueryCache();

    mockUseLinkDetail.mockReturnValue({
      data: MOCK_LINK,
      isLoading: false,
      error: null,
    });

    mockUseCollections.mockReturnValue({
      collections: MOCK_COLLECTIONS,
      isLoading: false,
      isError: false,
    });

    mockUseAddLinkToCollection.mockReturnValue({
      addLinkToCollection: jest.fn(),
      isPending: false,
    });
  });

  afterEach(() => {
    clearQueryCache();
  });

  it("shows CollectionsSectionSkeleton when useCollectionsForLink is loading", () => {
    mockUseCollectionsForLink.mockReturnValue({
      linkedCollectionIds: new Set<string>(),
      isLoading: true,
      isFetching: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<LinkDetailScreen linkId={MOCK_LINK.link_id} />, { wrapper });

    expect(screen.getByTestId("collections-section-skeleton")).toBeTruthy();
  });

  it("shows CollectionChips when useCollectionsForLink is not loading", () => {
    mockUseCollectionsForLink.mockReturnValue({
      linkedCollectionIds: new Set<string>(),
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<LinkDetailScreen linkId={MOCK_LINK.link_id} />, { wrapper });

    expect(screen.getByText("Collection 1")).toBeTruthy();
    expect(screen.queryByTestId("collections-section-skeleton")).toBeNull();
  });
});
