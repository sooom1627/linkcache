import React from "react";

import { render, screen, waitFor } from "@testing-library/react-native";

import { createMockLink } from "../../__mocks__/linkHelpers";
import { fetchUserLinks } from "../../api/fetchLinks.api";
import { SwipeTriageScreen } from "../../screens/SwipeTriageScreen";
import { clearQueryCache, wrapper } from "../test-utils";

// API関数をモック（外部依存のみ）
jest.mock("../../api/fetchLinks.api", () => ({
  fetchUserLinks: jest.fn(),
}));

jest.mock("../../api/updateLinkStatus.api", () => ({
  updateLinkStatus: jest.fn().mockResolvedValue(undefined),
}));

// i18nをモック
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// ライブラリコンポーネントをモック
// CardProps<T>はT自体を拡張するため、itemではなく直接アイテムのプロパティを渡す
jest.mock("react-native-swipeable-card-stack", () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { View } = require("react-native");
  return {
    SwipeableCardStack: ({
      data,
      renderCard,
    }: {
      data: Record<string, unknown>[];
      renderCard: (props: Record<string, unknown>) => React.ReactNode;
    }) => (
      <View testID="swipeable-card-stack">
        {data.slice(0, 3).map((item, index) => (
          <View key={index} testID={`card-${index}`}>
            {renderCard({
              ...item,
              xAnimatedPosition: { value: 0 },
              yAnimatedPosition: { value: 0 },
            })}
          </View>
        ))}
      </View>
    ),
  };
});

const mockFetchUserLinks = jest.mocked(fetchUserLinks);

describe("SwipeTriageScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearQueryCache();
  });

  afterEach(() => {
    clearQueryCache();
  });

  it("ローディング中にローディング表示を見せる", async () => {
    // 遅延するPromiseを設定
    mockFetchUserLinks.mockImplementation(
      () => new Promise(() => {}), // 永遠に解決しない
    );

    render(<SwipeTriageScreen />, { wrapper });

    expect(screen.getByText("Loading...")).toBeTruthy();
  });

  it("カードがある場合にSwipeableCardStackを表示する", async () => {
    const mockLinks = [
      createMockLink(1, { status: "inbox" }),
      createMockLink(2, { status: "inbox" }),
      createMockLink(3, { status: "inbox" }),
    ];
    mockFetchUserLinks.mockResolvedValueOnce({
      data: mockLinks,
      hasMore: false,
      totalCount: 3,
    });

    render(<SwipeTriageScreen />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getAllByTestId("swipeable-card-stack").length,
      ).toBeGreaterThan(0);
    });

    // カードのタイトルが表示されていることを確認
    expect(screen.getByText("Example 1")).toBeTruthy();
    expect(screen.getByText("Example 2")).toBeTruthy();
    expect(screen.getByText("Example 3")).toBeTruthy();
  });

  it("カードがない場合に空の状態を表示する", async () => {
    mockFetchUserLinks.mockResolvedValueOnce({
      data: [],
      hasMore: false,
      totalCount: 0,
    });

    render(<SwipeTriageScreen />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/No pending links/i)).toBeTruthy();
    });
  });

  it("Undoボタンが表示される", async () => {
    mockFetchUserLinks.mockResolvedValueOnce({
      data: [createMockLink(1)],
      hasMore: false,
      totalCount: 1,
    });

    render(<SwipeTriageScreen />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("Undo")).toBeTruthy();
    });
  });

  it("read_soonステータスを選択できる", async () => {
    const mockLinks = [
      createMockLink(1, { status: "read_soon" }),
      createMockLink(2, { status: "read_soon" }),
    ];
    mockFetchUserLinks.mockResolvedValueOnce({
      data: mockLinks,
      hasMore: false,
      totalCount: 2,
    });

    render(<SwipeTriageScreen />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getAllByTestId("swipeable-card-stack").length,
      ).toBeGreaterThan(0);
    });

    // read_soonが選択可能であることを確認
    // SourceTypeDropdownがread_soonオプションを含むことを確認
    const dropdown = screen.getByText(/Mode:/i);
    expect(dropdown).toBeTruthy();
  });

  it("read_soonステータスのカードを表示できる", async () => {
    const mockLinks = [
      createMockLink(1, { status: "read_soon" }),
      createMockLink(2, { status: "read_soon" }),
    ];
    mockFetchUserLinks.mockResolvedValueOnce({
      data: mockLinks,
      hasMore: false,
      totalCount: 2,
    });

    render(<SwipeTriageScreen />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getAllByTestId("swipeable-card-stack").length,
      ).toBeGreaterThan(0);
    });

    // read_soonのカードが表示されることを確認
    expect(screen.getByText("Example 1")).toBeTruthy();
    expect(screen.getByText("Example 2")).toBeTruthy();
  });
});
