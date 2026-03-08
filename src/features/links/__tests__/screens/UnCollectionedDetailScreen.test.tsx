import React from "react";

import { render, screen, waitFor } from "@testing-library/react-native";

import { LinkListFilterProvider } from "../../contexts/LinkListFilterContext";
import { useUncollectedLinks } from "../../hooks/useUncollectedLinks";
import {
  UnCollectionedDetailScreen,
  UnCollectionedDetailScreenContent,
} from "../../screens/UnCollectionedDetailScreen";
import { wrapper } from "../test-utils";

jest.mock("../../hooks/useUncollectedLinks", () => ({
  useUncollectedLinks: jest.fn(),
}));

jest.mock("../../components/LinkListCard", () => {
  return {
    LinkListCard: () => null,
  };
});

jest.mock("../../components/LinkListFilterMenu", () => {
  return {
    LinkListFilterMenu: () => null,
  };
});

const mockUseUncollectedLinks = jest.mocked(useUncollectedLinks);

describe("UnCollectionedDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("未所属リンクがある場合は一覧を表示する", async () => {
    mockUseUncollectedLinks.mockReturnValue({
      links: [
        {
          status_id: "status-1",
          user_id: "user-1",
          status: "new",
          triaged_at: null,
          read_at: null,
          link_id: "link-1",
          url: "https://example1.com",
          title: "Example 1",
          image_url: null,
          favicon_url: null,
          site_name: "Site 1",
          link_created_at: "2024-01-01T00:00:00Z",
        },
      ],
      isLoading: false,
      isFetchingNextPage: false,
      isError: false,
      error: null,
      hasNextPage: false,
      totalCount: 1,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    });

    render(<UnCollectionedDetailScreen />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("links.overview.un_collectioned")).toBeTruthy();
    });
  });

  it("エラー時はErrorStateViewを表示する", async () => {
    mockUseUncollectedLinks.mockReturnValue({
      links: [],
      isLoading: false,
      isFetchingNextPage: false,
      isError: true,
      error: new Error("Load failed"),
      hasNextPage: false,
      totalCount: 0,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    });

    render(<UnCollectionedDetailScreen />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("Load failed")).toBeTruthy();
    });
  });

  it("通常の空状態では未所属用EmptyStateを表示する", async () => {
    mockUseUncollectedLinks.mockReturnValue({
      links: [],
      isLoading: false,
      isFetchingNextPage: false,
      isError: false,
      error: null,
      hasNextPage: false,
      totalCount: 0,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    });

    render(<UnCollectionedDetailScreen />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getByText("links.overview.un_collectioned_empty_title"),
      ).toBeTruthy();
    });
  });

  it("フィルタ適用中の空状態ではリセット導線を表示する", async () => {
    mockUseUncollectedLinks.mockReturnValue({
      links: [],
      isLoading: false,
      isFetchingNextPage: false,
      isError: false,
      error: null,
      hasNextPage: false,
      totalCount: 0,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    });

    render(
      <LinkListFilterProvider
        initialState={{ status: "new", readStatus: "all" }}
      >
        <UnCollectionedDetailScreenContent />
      </LinkListFilterProvider>,
      { wrapper },
    );

    await waitFor(() => {
      expect(screen.getByText("links.list.filter_empty_title")).toBeTruthy();
    });

    expect(screen.getByText("links.filter.reset")).toBeTruthy();
  });
});
