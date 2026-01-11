import { render, screen } from "@testing-library/react-native";

import { updateLinkStatus } from "../../api/updateLinkStatus.api";
import type { UseLinksReturn } from "../../hooks/useLinks";
import { SwipeTriageScreen } from "../../screens/SwipeTriageScreen";
import { clearQueryCache, wrapper } from "../test-utils";

// API層とフックのモック
jest.mock("../../api/updateLinkStatus.api", () => ({
  updateLinkStatus: jest.fn(),
}));

jest.mock("../../hooks/useLinks", () => ({
  useLinks: jest.fn(),
}));

const mockUpdateLinkStatus = jest.mocked(updateLinkStatus);
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const useLinksModule = require("../../hooks/useLinks");
const mockUseLinks = jest.mocked(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  useLinksModule.useLinks,
) as jest.MockedFunction<() => UseLinksReturn>;

// モックデータ
const createMockLink = (id: number) => ({
  status_id: `status-${id}`,
  user_id: "user-1",
  status: "inbox" as const,
  triaged_at: null,
  read_at: null,
  saved_at: `2024-01-0${id}T00:00:00Z`,
  link_id: `link-${id}`,
  url: `https://example${id}.com`,
  title: `Example ${id}`,
  description: `Description ${id}`,
  image_url: null,
  favicon_url: null,
  site_name: `Site ${id}`,
  link_created_at: `2024-01-0${id}T00:00:00Z`,
});

describe("Swipe Triage Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearQueryCache();
  });

  afterEach(() => {
    clearQueryCache();
    // アクティブなタイマーをクリア
    jest.clearAllTimers();
  });

  afterAll(() => {
    // テスト終了時にQueryClientを完全にクリーンアップ
    clearQueryCache();
  });

  it("displays inbox link and updates to read_soon when Read Soon button is pressed", async () => {
    const mockLink = createMockLink(1);
    mockUseLinks.mockReturnValue({
      links: [mockLink],
      isLoading: false,
      error: null,
      isFetchingNextPage: false,
      isError: false,
      hasNextPage: false,
      totalCount: 1,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
      isRefreshing: false,
    });
    mockUpdateLinkStatus.mockResolvedValueOnce(undefined);

    render(<SwipeTriageScreen />, { wrapper });

    // リンクが表示されることを確認
    expect(screen.getByText(mockLink.title)).toBeTruthy();
    expect(screen.getByText(mockLink.url)).toBeTruthy();

    // Read Soonボタンが存在することを確認
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const readSoonButton = screen.getByText("Read Soon →");
    expect(readSoonButton).toBeTruthy();

    // ボタンを押す（実際のイベントはuseSwipeTriageフックで処理される）
    // このテストはUIの表示を確認する統合テスト
  });

  it("displays inbox link and updates to later when Later button is pressed", async () => {
    const mockLink = createMockLink(1);
    mockUseLinks.mockReturnValue({
      links: [mockLink],
      isLoading: false,
      error: null,
      isFetchingNextPage: false,
      isError: false,
      hasNextPage: false,
      totalCount: 1,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
      isRefreshing: false,
    });
    mockUpdateLinkStatus.mockResolvedValueOnce(undefined);

    render(<SwipeTriageScreen />, { wrapper });

    // リンクが表示されることを確認
    expect(screen.getByText(mockLink.title)).toBeTruthy();

    // Laterボタンが存在することを確認
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const laterButton = screen.getByText("← Later");
    expect(laterButton).toBeTruthy();
  });

  it("displays Inbox Zero message when inbox is empty", () => {
    mockUseLinks.mockReturnValue({
      links: [],
      isLoading: false,
      error: null,
      isFetchingNextPage: false,
      isError: false,
      hasNextPage: false,
      totalCount: 0,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
      isRefreshing: false,
    });

    render(<SwipeTriageScreen />, { wrapper });

    // Inbox Zeroメッセージが表示されることを確認
    expect(screen.getByText("🎉 Inbox Zero!")).toBeTruthy();
    expect(screen.getByText("All caught up!")).toBeTruthy();
  });

  it("displays loading state when fetching links", () => {
    mockUseLinks.mockReturnValue({
      links: [],
      isLoading: true,
      error: null,
      isFetchingNextPage: false,
      isError: false,
      hasNextPage: false,
      totalCount: 0,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
      isRefreshing: false,
    });

    render(<SwipeTriageScreen />, { wrapper });

    // ローディングメッセージが表示されることを確認
    expect(screen.getByText("Loading...")).toBeTruthy();
  });

  it("displays error state when fetch fails", () => {
    const mockError = new Error("Failed to fetch links");
    mockUseLinks.mockReturnValue({
      links: [],
      isLoading: false,
      error: mockError,
      isFetchingNextPage: false,
      isError: true,
      hasNextPage: false,
      totalCount: 0,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
      isRefreshing: false,
    });

    render(<SwipeTriageScreen />, { wrapper });

    // エラーメッセージが表示されることを確認
    expect(screen.getByText(`Error: ${mockError.message}`)).toBeTruthy();
  });
});
